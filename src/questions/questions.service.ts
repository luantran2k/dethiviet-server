import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const { numberOfAnswers, ...question } = createQuestionDto;
    const newQuestion = await this.prisma.question.create({ data: question });
    if (numberOfAnswers) {
      await this.prisma.answer.createMany({
        data: Array(numberOfAnswers).fill({ questionId: newQuestion.id }),
      });
      return this.findOne(newQuestion.id);
    }
    return newQuestion;
  }

  findAll() {
    return this.prisma.question.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.question.findFirst({
      where: { id },
      include: {
        answers: {
          orderBy: {
            id: 'asc',
          },
        },
      },
    });
  }

  update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  remove(id: number) {
    return this.prisma.question.delete({ where: { id } });
  }
}
