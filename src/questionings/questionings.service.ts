import { ForbiddenException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import Ultis from 'src/Utils/Ultis';
import { CreateQuestioningDto } from './dto/create-questioning.dto';
import { UpdateQuestioningDto } from './dto/update-questioning.dto';

@Injectable()
export class QuestioningsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    userId: number,
    createQuestioningDto: CreateQuestioningDto,
    files: {
      audioFile?: Express.Multer.File[];
      imageFiles?: Express.Multer.File[];
    },
  ) {
    const promiseArray = [];
    if (files?.audioFile && files?.audioFile?.length > 0) {
      const audioFilePromise = this.cloudinary.uploadFile(files.audioFile[0], {
        folderName: 'post/audios',
      });
      promiseArray.push(audioFilePromise);
    } else {
      promiseArray.push(undefined);
    }
    if (files?.imageFiles && files?.imageFiles.length > 0) {
      const imageFilesPromise = this.cloudinary.uploadFiles(files.imageFiles, {
        folderName: 'post/images',
      });
      promiseArray.push(...imageFilesPromise);
    }

    const [audioRes, ...imagesRes] = await Promise.all(promiseArray);

    if (audioRes?.secure_url) {
      createQuestioningDto.questioningAudio = audioRes.secure_url;
    }
    if (imagesRes.some((image) => image?.secure_url)) {
      createQuestioningDto.questioningImage = imagesRes.map(
        (image) => image.secure_url,
      );
    }
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

  async findAll({
    page,
    search,
    tag,
  }: {
    page: number;
    search?: string;
    tag?: string;
  }) {
    const quantity = 10;
    const totalsPromise =
      page === 0
        ? this.prisma.questioning.count({
            orderBy: {
              createdAt: 'desc',
            },
          })
        : null;
    const postsPromise = this.prisma.questioning.findMany({
      take: quantity,
      skip: page * quantity,
      where: {
        ...(search
          ? {
              content: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
        ...(tag
          ? {
              tags: {
                has: tag,
              },
            }
          : {}),
      },
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
    const [total, posts] = await Promise.all([totalsPromise, postsPromise]);
    return { posts, total };
  }

  findOne(id: number) {
    return this.prisma.questioning.findFirst({ where: { id: id } });
  }

  async update(
    id: number,
    userId: number,
    updateQuestioningDto: UpdateQuestioningDto,
  ) {
    const questioning = await this.prisma.questioning.findFirst({
      where: { id },
    });
    if (questioning.ownerId !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.questioning.update({
      where: { id },
      data: updateQuestioningDto,
    });
  }

  async remove(id: number, userId: number) {
    const questioning = await this.prisma.questioning.findFirst({
      where: { id: id },
    });

    if (userId !== questioning.ownerId) {
      throw new ForbiddenException();
    }
    const url: string[] = [];
    if (questioning.questioningAudio) {
      url.push(questioning.questioningAudio);
    }
    if (questioning.questioningImage.length > 0) {
      url.push(...questioning.questioningImage);
    }
    if (url.length > 0) {
      const promiseArray = url.map((url) => {
        this.cloudinary.removeFile(
          Ultis.getPublicId(url),
          url.includes('post/images') ? 'image' : 'video',
        );
      });
      await Promise.all(promiseArray);
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
