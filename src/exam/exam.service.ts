import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import prismaUltis from 'src/Utils/prismaUltis';
import { PrismaService } from './../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamService {
  private readonly includeExamData = {
    parts: {
      select: {
        id: true,
        clientId: true,
        title: true,
        description: true,
        numberOfAnswers: true,
        totalPoints: true,
        type: true,
        questions: {
          select: {
            id: true,
            clientId: true,
            title: true,
            description: true,
            explain: true,
            answers: {
              select: {
                id: true,
                clientId: true,
                isTrue: true,
                value: true,
              },
            },
          },
        },
      },
    },
  };

  constructor(private prisma: PrismaService) {}
  create(createExamDto: CreateExamDto) {
    return this.prisma.exam.create({
      data: prismaUltis.objectToPrismaCreate(
        createExamDto,
      ) as Prisma.ExamCreateInput,
      include: this.includeExamData,
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
      where: { id: id },
      include: this.includeExamData,
    });
  }

  update(id: number, updateExamDto: UpdateExamDto) {
    const data = prismaUltis.objectToPrismaUpdate(updateExamDto, id);
    return this.prisma.exam.update({
      where: { id: id },
      data,
      include: this.includeExamData,
    });
  }

  remove(id: number) {
    return this.prisma.exam.delete({
      where: { id: id },
    });
  }
}
