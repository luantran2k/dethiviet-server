import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExplainingDto } from './dto/create-explaining.dto';
import { UpdateExplainingDto } from './dto/update-explaining.dto';

@Injectable()
export class ExplainingsService {
  constructor(private readonly prisma: PrismaService) {}
  create(ownerId: number, createExplainingDto: CreateExplainingDto) {
    return this.prisma.explaining.create({
      data: {
        ...createExplainingDto,
        ownerId: 1,
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
    return `This action returns all explainings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} explaining`;
  }

  async update(
    id: number,
    userId: number,
    updateExplainingDto: UpdateExplainingDto,
  ) {
    const explaining = await this.prisma.explaining.findFirst({
      where: { id },
    });
    if (explaining.ownerId !== userId) {
      throw new UnauthorizedException();
    }
    return this.prisma.explaining.update({
      where: { id },
      data: updateExplainingDto,
    });
  }

  async remove(id: number, userId: number) {
    const explaining = await this.prisma.explaining.findFirst({
      where: { id },
    });
    if (explaining.ownerId !== userId) {
      throw new UnauthorizedException();
    }
    return this.prisma.explaining.delete({ where: { id } });
  }

  removeUpVoteInDB(id: number, userId: number, upVote: number[]) {
    return this.prisma.explaining.update({
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
    return this.prisma.explaining.update({
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
    const explaining = await this.prisma.explaining.findFirst({
      where: { id },
      select: {
        upVote: true,
        downVote: true,
      },
    });
    let upVotePromise = undefined;
    let downVotePromise = undefined;
    if (!explaining.upVote.some((id) => id === userId)) {
      upVotePromise = this.prisma.explaining.update({
        where: { id },
        data: {
          upVote: {
            push: userId,
          },
        },
      });
    }
    if (explaining.downVote.some((id) => id === userId)) {
      downVotePromise = this.removeDownVoteInDB(
        id,
        userId,
        explaining.downVote,
      );
    }
    await Promise.all([upVotePromise, downVotePromise]);
    return this.prisma.explaining.findFirst({
      where: { id },
      select: {
        upVote: true,
        downVote: true,
      },
    });
  }
  async downVote(id: number, userId: number) {
    const explaining = await this.prisma.explaining.findFirst({
      where: { id },
      select: {
        upVote: true,
        downVote: true,
      },
    });
    let upVotePromise = undefined;
    let downVotePromise = undefined;
    if (!explaining.downVote.some((id) => id === userId)) {
      downVotePromise = this.prisma.explaining.update({
        where: { id },
        data: {
          downVote: {
            push: userId,
          },
        },
      });
    }
    if (explaining.upVote.some((id) => id === userId)) {
      upVotePromise = this.removeUpVoteInDB(id, userId, explaining.upVote);
    }
    await Promise.all([upVotePromise, downVotePromise]);
    return this.prisma.explaining.findFirst({
      where: { id },
      select: {
        upVote: true,
        downVote: true,
      },
    });
  }

  async removeUpVote(id: number, userId: number) {
    const explaining = await this.prisma.explaining.findFirst({
      where: { id },
    });
    return this.removeUpVoteInDB(id, userId, explaining.upVote);
  }
  async removeDownVote(id: number, userId: number) {
    const explaining = await this.prisma.explaining.findFirst({
      where: { id },
    });
    return this.removeDownVoteInDB(id, userId, explaining.downVote);
  }
}
