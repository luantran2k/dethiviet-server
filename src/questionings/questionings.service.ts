import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestioningDto } from './dto/create-questioning.dto';
import { UpdateQuestioningDto } from './dto/update-questioning.dto';

@Injectable()
export class QuestioningsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createQuestioningDto: CreateQuestioningDto) {
    return await this.prisma.questioning.create({
      data: {
        ...createQuestioningDto,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImg: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.questioning.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        explainings: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                name: true,
                profileImg: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImg: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} questioning`;
  }

  update(id: number, updateQuestioningDto: UpdateQuestioningDto) {
    return `This action updates a #${id} questioning`;
  }

  async remove(id: number, userId: number) {
    const questioning = await this.prisma.questioning.findFirst({
      where: { id: id },
    });
    if (userId !== questioning.ownerId) {
      throw new UnauthorizedException();
    }
    return this.prisma.questioning.delete({ where: { id } });
  }

  upVote(id: number) {
    return this.prisma.questioning.update({
      where: { id },
      data: {
        vote: { increment: 1 },
      },
      select: { vote: true },
    });
  }
  downVote(id: number) {
    return this.prisma.questioning.update({
      where: { id },
      data: {
        vote: { decrement: 1 },
      },
      select: { vote: true },
    });
  }
}
