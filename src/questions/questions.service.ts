import { Question } from '@prisma/client';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FileRespone } from 'src/cloudinary/interfaces/FileRespone';
import Ultis from 'src/Utils/ultis';
import { url } from 'inspector';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

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

  async updateQuesitonAudio(id: number, questionAudio?: Express.Multer.File) {
    const audioUpload = questionAudio
      ? await this.cloudinary.uploadFile(questionAudio, {
          folderName: 'audio/questionAudios',
        })
      : undefined;
    if (audioUpload.url) {
      await this.deleteQuesitonAudio(id, false);
      await this.prisma.question.update({
        where: { id },
        data: { questionAudio: audioUpload.url },
      });
      return audioUpload;
      //return { url: audioUpload.url };
    }
  }

  async deleteTest(publicId: string) {
    // const res = await this.cloudinary.getAllFileInFolder(
    //   'dethiviet/audio/questionAudios',
    //   {
    //     resourceType: 'video',
    //   },
    // );
    // return { ...res };
    return await this.cloudinary.removeFile(publicId, 'video');
  }

  async deleteQuesitonAudio(id: number, deleteInDB: boolean = true) {
    const question = await this.findOne(id);
    if (question.questionAudio) {
      const result = await this.cloudinary.removeFile(
        Ultis.getPublicId(question.questionAudio),
        'video',
      );
      if (deleteInDB) {
        await this.prisma.question.update({
          where: { id },
          data: { questionAudio: null },
        });
      }
      return result;
    }
    return { message: 'Không có audio' };
  }

  async addQuestionImages(id: number, questionImages?: Express.Multer.File[]) {
    const imagesUpload = questionImages
      ? this.cloudinary.uploadFiles(questionImages, {
          folderName: 'image/questionImages',
        })
      : [];
    const imagesUploaded = await Promise.all(imagesUpload);
    const res = imagesUploaded.map((image) => {
      return this.prisma.question.update({
        where: { id },
        data: {
          questionImages: {
            push: image.secure_url,
          },
        },
      });
    });
    await Promise.all(res);
    return imagesUploaded;
  }

  async deleteQuestionImage(id: number, deleteUrl: string) {
    const question = await this.findOne(id);
    const listUrl = question.questionImages;
    if (listUrl && listUrl.includes(deleteUrl)) {
      const res = await this.cloudinary.removeFile(
        Ultis.getPublicId(deleteUrl),
        'image',
      );
      await this.prisma.question.update({
        where: { id },
        data: {
          questionImages: listUrl.filter((url) => url !== deleteUrl),
        },
      });
      return res;
    }
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  remove(id: number) {
    return this.prisma.question.delete({ where: { id } });
  }
}
