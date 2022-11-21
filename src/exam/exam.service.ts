import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import prismaUltis from 'src/Utils/prismaUltis';
import { PrismaService } from './../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}
  create(createExamDto: CreateExamDto) {
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
      },
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        title: {
          contains: title,
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

  findOne(id: number) {
    return this.prisma.exam.findUniqueOrThrow({
      where: { id },
      include: {
        parts: {
          include: {
            questions: {
              include: {
                answers: true,
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

  remove(id: number) {
    return this.prisma.exam.delete({
      where: { id: id },
    });
  }
}
