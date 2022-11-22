import { Injectable } from '@nestjs/common';
import { Prisma, Question } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createPartDto: CreatePartDto) {
    const { numberOfQuestions, ...part } = createPartDto;
    //create Part
    const newPart = await this.prisma.part.create({ data: part });

    //Create questions
    await this.prisma.question.createMany({
      data: Array(numberOfQuestions).fill({
        partId: newPart.id,
      }),
    });

    const questions = await this.prisma.question.findMany({
      where: { partId: newPart.id },
    });

    //create Answer
    await Promise.all(
      questions.map(async (questions) => {
        return {
          ...questions,
          answers: await this.prisma.answer.createMany({
            data: Array(part.numberOfAnswers).fill({
              questionId: questions.id,
            }),
          }),
        };
      }),
    );

    return this.findOne(newPart.id);
  }

  findAll() {
    return this.prisma.part.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.part.findFirst({
      where: { id },
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
    });
  }

  update(id: number, updatePartDto: UpdatePartDto) {
    return this.prisma.part.update({ where: { id }, data: updatePartDto });
  }

  remove(id: number) {
    return this.prisma.part.delete({ where: { id } });
  }
}
