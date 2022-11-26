import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Exam, Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PartsService } from 'src/parts/parts.service';
import prismaUltis from 'src/Utils/prismaUltis';
import Ultis from 'src/Utils/Ultis';
import { PrismaService } from './../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamEntity } from './entities/exam.entity';

@Injectable()
export class ExamService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly partsService: PartsService,
  ) {}
  async create(
    createExamDto: CreateExamDto,
    documentFile: Express.Multer.File,
  ) {
    const data = createExamDto;
    const documentUpload = await this.uploadDocumentFile(documentFile);
    if (documentUpload?.secure_url) {
      return this.prisma.exam.create({
        data: { ...createExamDto, documentUrl: documentUpload.secure_url },
      });
    }
    return this.prisma.exam.create({
      data: createExamDto,
    });
  }

  findAll(
    page: number,
    quantity: number,
    title?: string,
    subjectName?: string,
    year?: number,
    grade?: string,
  ) {
    if (year < 1990 || year > 2100)
      throw new BadRequestException(
        'Năm không hợp lệ, năm phải trong khoảng 1990 - 2100',
      );
    return this.prisma.exam.findMany({
      skip: page * quantity,
      take: quantity,
      select: {
        id: true,
        ownerId: true,
        title: true,
        date: true,
        subjectName: true,
        grade: true,
        owner: {
          select: {
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        title: {
          contains: title,
          mode: 'insensitive',
        },
        subjectName: {
          contains: subjectName,
        },
        date: {
          gte: year && new Date(year + '-01-01'),
          lte: year && new Date(year + '-12-31'),
        },
        grade: {
          equals: grade,
        },
      },
    });
  }

  findOne(id: number, includePart?: boolean, includeOwner?: boolean) {
    return this.prisma.exam.findUniqueOrThrow({
      where: { id },
      include: {
        owner: includeOwner && {
          select: {
            id: true,
            username: true,
            name: true,
            profileImg: true,
          },
        },
        parts: includePart && {
          orderBy: {
            id: 'asc',
          },
          include: {
            questions: {
              orderBy: {
                id: 'asc',
              },
              include: {
                answers: {
                  orderBy: {
                    id: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  update(id: number, updateExamDto: UpdateExamDto) {
    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: number) {
    const exam = await this.findOne(id, true);
    if (exam?.documentUrl) {
      await this.cloudinary.removeFile(
        Ultis.getPublicId(exam.documentUrl),
        'image',
      );
    }
    if (exam?.parts) {
      const partRemove = exam.parts.map((part) => {
        return this.partsService.remove(part.id, part);
      });
      await Promise.all(partRemove);
    }
    return this.prisma.exam.delete({
      where: { id: id },
    });
  }

  async uploadDocumentFile(documentFile: Express.Multer.File) {
    if (documentFile) {
      const documentUpload = await this.cloudinary.uploadFile(documentFile, {
        folder: 'exam/documents',
      });
      return documentUpload;
    }
    return undefined;
  }
}
