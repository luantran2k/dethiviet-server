import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Exam, Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PartsService } from 'src/parts/parts.service';
import prismaUltis from 'src/Utils/prismaUltis';
import Ultis from 'src/Utils/Ultis';
import { PrismaService } from './../prisma/prisma.service';
import CompleteExamDto from './dto/completed-exam.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import FavoriteExamDto from './dto/favorite-exam.dto';
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
            profileImg: true,
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

  async findOne(
    id: number,
    {
      userId,
      includePart,
      includeOwner,
    }: { userId?: number; includePart?: boolean; includeOwner?: boolean },
  ) {
    const { UserFavoriteExam, ...result } = await this.prisma.exam.findFirst({
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
        UserFavoriteExam: userId && {
          where: {
            userId,
          },
        },
      },
    });
    return {
      ...result,
      isFavorited: UserFavoriteExam[0]?.userId === userId ? true : false,
    };
  }

  update(id: number, updateExamDto: UpdateExamDto) {
    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: number) {
    const exam = await this.findOne(id, { includePart: true });
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
        folderName: 'exam/documents',
      });
      return documentUpload;
    }
    return undefined;
  }

  async completedExam(examId: number, completeExamEto: CompleteExamDto) {
    return this.prisma.userCompleteExam.create({
      data: {
        userId: completeExamEto.userId,
        examId: examId,
      },
    });
  }
  async addFavoriteExam(examId: number, userId: number) {
    try {
      return this.prisma.userFavoriteExam.create({
        data: {
          examId,
          userId,
        },
      });
    } catch {
      throw new ConflictException('Đã có trong danh sách yêu thích');
    }
  }
  async deleteFavoriteExam(examId: number, userId: number) {
    return this.prisma.userFavoriteExam.delete({
      where: {
        userId_examId: {
          examId,
          userId,
        },
      },
    });
  }
}
