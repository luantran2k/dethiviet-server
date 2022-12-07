import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestioningDto } from './dto/create-questioning.dto';
import { UpdateQuestioningDto } from './dto/update-questioning.dto';

@Injectable()
export class QuestioningsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, createQuestioningDto: CreateQuestioningDto) {
    return this.prisma.questioning.create({
      data: {
        ...createQuestioningDto,
        ownerId: userId,
      },
    });
  }

  findAll() {
    return this.prisma.questioning.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} questioning`;
  }

  update(id: number, updateQuestioningDto: UpdateQuestioningDto) {
    return `This action updates a #${id} questioning`;
  }

  remove(id: number) {
    return `This action removes a #${id} questioning`;
  }
}
