import { Injectable } from '@nestjs/common';
import { Prisma, Question } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import Ultis from 'src/Utils/Ultis';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}
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

  async updatePartAudio(id: number, partAudio?: Express.Multer.File) {
    const audioUpload = partAudio
      ? await this.cloudinary.uploadFile(partAudio, {
          folderName: 'audio/partAudios',
        })
      : undefined;
    if (audioUpload.secure_url) {
      await this.deletePartAudio(id, false);
      await this.prisma.part.update({
        where: { id },
        data: { partAudio: audioUpload.secure_url },
      });
      return { url: audioUpload.secure_url };
    }
  }

  async deletePartAudio(id: number, deleteInDB: boolean = true) {
    const question = await this.findOne(id);
    if (question.partAudio) {
      const result = await this.cloudinary.removeFile(
        Ultis.getPublicId(question.partAudio),
        'video',
      );
      if (deleteInDB) {
        await this.prisma.part.update({
          where: { id },
          data: { partAudio: null },
        });
      }
      return result;
    }
    return { message: 'Không có audio' };
  }

  async remove(id: number) {
    await this.deletePartAudio(id);
    return this.prisma.part.delete({ where: { id } });
  }
}
