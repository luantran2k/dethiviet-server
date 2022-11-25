import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import Ultis from 'src/Utils/Ultis';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

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
    if (audioUpload.secure_url) {
      await this.deleteQuesitonAudio(id, false);
      await this.prisma.question.update({
        where: { id },
        data: { questionAudio: audioUpload.secure_url },
      });
      return { url: audioUpload.secure_url };
      //return { url: audioUpload.url };
    }
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
    return { questionImages: (await this.findOne(id)).questionImages };
  }

  async deleteQuestionImage(id: number, deleteUrl: string) {
    const question = await this.findOne(id);
    const listUrl = question.questionImages;
    if (listUrl && listUrl.includes(deleteUrl)) {
      const res = await this.cloudinary.removeFile(
        Ultis.getPublicId(deleteUrl),
        'image',
      );
      const questionUpdated = await this.prisma.question.update({
        where: { id },
        data: {
          questionImages: listUrl.filter((url) => url !== deleteUrl),
        },
      });
      return { questionImages: questionUpdated.questionImages };
    }
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    return this.prisma.question.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async remove(id: number) {
    const question = await this.findOne(id);
    let removeAudio = undefined,
      removeImages = undefined;
    if (question.questionAudio) {
      removeAudio = this.deleteQuesitonAudio(id);
    }
    if (question.questionImages) {
      removeImages = question.questionImages.map((url) => {
        return this.deleteQuestionImage(id, url);
      });
    }
    await Promise.all([removeAudio, ...removeImages]);
    return this.prisma.question.delete({ where: { id } });
  }
}
