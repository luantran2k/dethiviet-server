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
      throw new UnauthorizedException(
        `userId: ${userId}, ownerId: ${questioning.ownerId}`,
      );
    }
    return this.prisma.questioning.delete({ where: { id } });
  }

  removeUpVoteInDB(id: number, userId: number, upVote: number[]) {
    return this.prisma.questioning.update({
      where: { id },
      data: {
        upVote: {
          set: upVote.filter((id) => id !== userId),
        },
      },
      select: {
        upVote: true,
        downVote: true,
      },
    });
  }
  removeDownVoteInDB(id: number, userId: number, downVote: number[]) {
    return this.prisma.questioning.update({
      where: { id },
      data: {
        downVote: {
          set: downVote.filter((id) => id !== userId),
        },
      },
      select: {
        upVote: true,
        downVote: true,
      },
    });
  }

  async upVote(id: number, userId: number) {
    const questioning = await this.prisma.questioning.findFirst({
      where: { id },
      select: {
        upVote: true,
        downVote: true,
      },
    });
    let upVotePromise = undefined;
    let downVotePromise = undefined;
    if (!questioning.upVote.some((id) => id === userId)) {
      upVotePromise = this.prisma.questioning.update({
        where: { id },
        data: {
          upVote: {
            push: userId,
          },
        },
      });
    }
    if (questioning.downVote.some((id) => id === userId)) {
      downVotePromise = this.removeDownVoteInDB(
        id,
        userId,
        questioning.downVote,
      );
    }
    await Promise.all([upVotePromise, downVotePromise]);
    return this.prisma.questioning.findFirst({
      where: { id },
      select: {
        upVote: true,
        downVote: true,
      },
    });
  }
  async downVote(id: number, userId: number) {
    const questioning = await this.prisma.questioning.findFirst({
      where: { id },
      select: {
        upVote: true,
        downVote: true,
      },
    });
    let upVotePromise = undefined;
    let downVotePromise = undefined;
    if (!questioning.downVote.some((id) => id === userId)) {
      downVotePromise = this.prisma.questioning.update({
        where: { id },
        data: {
          downVote: {
            push: userId,
          },
        },
      });
    }
    if (questioning.upVote.some((id) => id === userId)) {
      upVotePromise = this.removeUpVoteInDB(id, userId, questioning.upVote);
    }
    await Promise.all([upVotePromise, downVotePromise]);
    return this.prisma.questioning.findFirst({
      where: { id },
      select: {
        upVote: true,
        downVote: true,
      },
    });
  }

  async removeUpVote(id: number, userId: number) {
    const questioning = await this.prisma.questioning.findFirst({
      where: { id },
    });
    return this.removeUpVoteInDB(id, userId, questioning.upVote);
  }
  async removeDownVote(id: number, userId: number) {
    const questioning = await this.prisma.questioning.findFirst({
      where: { id },
    });
    return this.removeDownVoteInDB(id, userId, questioning.downVote);
  }
}
