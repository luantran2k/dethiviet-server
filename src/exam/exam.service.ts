import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PartsService } from 'src/parts/parts.service';
import QuestionEntity from 'src/questions/entities/question.entity';
import Ultis from 'src/Utils/Ultis';
import { AnswerEntityWithCheck } from './../answers/entities/answer.entity';
import { PrismaService } from './../prisma/prisma.service';
import CompleteExamDto from './dto/completed-exam.dto';
import ExamsAutoCreatedDto from './dto/create-exam-auto.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import ExamToCreateInfoDto from './dto/exam-to-create-info.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

export interface QuestionInfos {
  questions: { id: number }[];
  type: string;
}

export interface QuestionResult extends Partial<QuestionEntity> {
  isQuestionTrue: boolean;
}

@Injectable()
export class ExamService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
    private readonly partsService: PartsService,
  ) {}
  async create(
    createExamDto: CreateExamDto,
    documentFile: Express.Multer.File,
  ) {
    const data = createExamDto;
    if (data.isPublic === false) {
      data.securityCode = Ultis.getRandomString(5);
    }
    const documentUpload = await this.uploadDocumentFile(documentFile);
    if (documentUpload?.secure_url) {
      return this.prisma.exam.create({
        data: { ...createExamDto, documentUrl: documentUpload.secure_url },
      });
    }
    return this.prisma.exam.create({
      data: createExamDto,
    });
  }

  findAll(
    page: number,
    quantity: number,
    title?: string,
    subjectName?: string,
    year?: number,
    grade?: string,
  ) {
    if (year < 1990 || year > 2100)
      throw new BadRequestException(
        'Năm không hợp lệ, năm phải trong khoảng 1990 - 2100',
      );
    return this.prisma.exam.findMany({
      skip: page * quantity,
      take: quantity,
      select: {
        id: true,
        ownerId: true,
        title: true,
        date: true,
        subjectName: true,
        grade: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
            profileImg: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isPublic: true,
        title: {
          contains: title,
          mode: 'insensitive',
        },
        subjectName: {
          contains: subjectName,
        },
        date: {
          gte: year && new Date(year + '-01-01'),
          lte: year && new Date(year + '-12-31'),
        },
        grade: {
          equals: grade,
        },
      },
    });
  }

  async findOne(
    id: number,
    {
      userId,
      includePart,
      includeOwner,
      withRelatedExams,
      withAnswer,
    }: {
      userId?: number;
      includePart?: boolean;
      includeOwner?: boolean;
      withRelatedExams?: boolean;
      withAnswer?: boolean;
    },
  ) {
    const exam = await this.prisma.exam.findFirst({
      where: { id },
      include: {
        owner: includeOwner && {
          select: {
            id: true,
            username: true,
            name: true,
            profileImg: true,
          },
        },
        parts: includePart && {
          orderBy: {
            id: 'asc',
          },
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
                  select: {
                    id: true,
                    value: true,
                    isTrue: withAnswer || false,
                  },
                },
              },
            },
          },
        },
        UserFavoriteExam: userId && {
          where: {
            userId,
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Bài kiểm tra không tồn tại');
    }
    const { UserFavoriteExam, ...result } = exam;
    let relatedExams = undefined;

    if (withRelatedExams) {
      relatedExams = await this.prisma.exam.findMany({
        take: 10,
        select: {
          id: true,
          title: true,
          subjectName: true,
          grade: true,
          createdAt: true,
          duration: true,
          owner: {
            select: {
              username: true,
              name: true,
              profileImg: true,
            },
          },
        },
        where: {
          id: {
            not: result.id,
          },
          isPublic: true,
          isOriginal: true,
          subjectName: {
            contains: result.subjectName,
          },
          grade: {
            equals: result.grade,
          },
        },
      });
    }

    if (!result.isOriginal && includePart) {
      const partWithQuestionPromise = result.parts.map(async (part) => {
        // questions: await this.prisma.question.findMany({
        //   where: {
        //     id: { in: part.questionIds },
        //   },
        //   include: {
        //     answers: true,
        //   },
        // }),
        const questions = await Promise.all(
          part.questionIds.map(async (id) => {
            return await this.prisma.question.findFirst({
              where: { id },
              include: {
                answers: true,
              },
            });
          }),
        );
        return {
          ...part,
          questions,
        };
      });
      const partWithQuestion = await Promise.all(partWithQuestionPromise);
      result.parts = partWithQuestion;
    }

    return {
      ...result,
      isFavorited: UserFavoriteExam[0]?.userId === userId ? true : false,
      relatedExams: withRelatedExams ? relatedExams : undefined,
    };
  }

  update(id: number, updateExamDto: UpdateExamDto) {
    if (updateExamDto.isPublic === false) {
      updateExamDto.securityCode = Ultis.getRandomString(5);
    }

    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: number) {
    const exam = await this.findOne(id, { includePart: true });

    if (exam?.documentUrl) {
      await this.cloudinary.removeFile(
        Ultis.getPublicId(exam.documentUrl),
        'image',
      );
    }
    if (exam?.parts) {
      const partRemove = exam.parts.map((part) => {
        return this.partsService.remove(part.id, part, exam.isOriginal);
      });
      await Promise.all(partRemove);
    }
    return this.prisma.exam.delete({
      where: { id: id },
    });
  }

  async uploadDocumentFile(documentFile: Express.Multer.File) {
    if (documentFile) {
      const documentUpload = await this.cloudinary.uploadFile(documentFile, {
        folderName: 'exam/documents',
      });
      return documentUpload;
    }
    return undefined;
  }

  async completedExam(userId: number, completeExamDto: CompleteExamDto) {
    const resultExam = await this.prisma.exam.findFirst({
      where: { id: completeExamDto.id },
      select: {
        id: true,
        title: true,
        subjectName: true,
        createdAt: true,
        isOriginal: true,
        parts: {
          orderBy: {
            id: 'asc',
          },
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
        },
      },
    });

    const partsChecked = completeExamDto.parts.reduce(
      (output, part, partIndex) => {
        const pointPerQuestion = part.totalPoints / part.questions.length;
        const questionsResult: QuestionResult[] = part.questions.reduce(
          (output, question, questionIndex) => {
            const resultQuestion =
              resultExam.parts[partIndex].questions[questionIndex];
            const answers: AnswerEntityWithCheck[] = question.answers.map(
              (answer, answerIndex) => {
                const resultAnswer = resultQuestion.answers[answerIndex];
                if (resultAnswer.isTrue == Boolean(answer.isTrue)) {
                  return {
                    ...answer,
                    isAnswerFail: false,
                  };
                } else {
                  return {
                    ...answer,
                    isAnswerFail: true,
                  };
                }
              },
            );
            const isQuestionTrue = !answers.some(
              (answer) => answer.isAnswerFail == true,
            );
            return [
              ...output,
              {
                ...resultQuestion,
                isQuestionTrue,
                answers,
              },
            ];
          },
          [],
        );
        const numberCorrectQuestionsOfPart = questionsResult.filter(
          (questionResult) => questionResult.isQuestionTrue == true,
        ).length;
        const partScore: number =
          numberCorrectQuestionsOfPart * pointPerQuestion;

        return {
          score: output.score + partScore,
          totalQuestions: output.totalQuestions + part.questions.length,
          numberCorrectQuestions:
            output.numberCorrectQuestions + numberCorrectQuestionsOfPart,
          partsResult: [
            ...output.partsResult,
            {
              ...part,
              partScore,
              numberCorrectQuestionsOfPart,
              questions: questionsResult,
            },
          ],
        };
      },
      {
        score: 0,
        totalQuestions: 0,
        numberCorrectQuestions: 0,
        partsResult: [],
      },
    );
    return this.prisma.userCompleteExam.create({
      data: {
        userId,
        examId: completeExamDto.id,
        score: partsChecked.score,
        examCompleted: JSON.stringify({
          ...resultExam,
          score: partsChecked.score,
          parts: partsChecked.partsResult,
          numberCorrectQuestions: partsChecked.numberCorrectQuestions,
          totalQuestions: partsChecked.totalQuestions,
        }),
      },
    });
  }
  async addFavoriteExam(examId: number, userId: number) {
    try {
      return this.prisma.userFavoriteExam.create({
        data: {
          examId,
          userId,
        },
      });
    } catch {
      throw new ConflictException('Đã có trong danh sách yêu thích');
    }
  }
  async deleteFavoriteExam(examId: number, userId: number) {
    return this.prisma.userFavoriteExam.delete({
      where: {
        userId_examId: {
          examId,
          userId,
        },
      },
    });
  }
  async getExamsIndexPage() {
    const quantity = 10;

    const selectUser = {
      id: true,
      name: true,
      username: true,
      profileImg: true,
    };
    const selectExam = {
      id: true,
      isPublic: true,
      ownerId: true,
      title: true,
      date: true,
      subjectName: true,
      grade: true,
      createdAt: true,
      owner: {
        select: selectUser,
      },
    };
    const lastestExamsPromise = this.prisma.exam.findMany({
      take: quantity,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        isPublic: true,
      },
      select: selectExam,
    });

    const examsWithCount = await this.prisma.userCompleteExam.groupBy({
      by: ['examId'],
      where: {
        exam: {
          isPublic: true,
        },
        completeAt: {
          gte: Ultis.getThisFirstDateOfMonth(),
          lte: Ultis.getThisLastDateOfMonth(),
        },
      },
      _count: {
        completeAt: true,
      },
      orderBy: {
        _count: {
          completeAt: 'desc',
        },
      },
    });

    const popularMonthExamsPromise = examsWithCount.map(async (exam) => {
      return {
        exam: await this.prisma.exam.findFirst({
          where: { id: exam.examId, isPublic: true },
          include: {
            owner: {
              select: selectUser,
            },
          },
        }),
        completeCount: exam._count,
      };
    });

    const [lastestExams, popularMonthExams] = await Promise.all([
      lastestExamsPromise,
      Promise.all(popularMonthExamsPromise),
    ]);
    return {
      lastestExams,
      popularMonthExams: popularMonthExams.map((exam) => ({
        ...exam.exam,
        completedCount: exam.completeCount.completeAt,
      })),
    };
  }

  async getExamToCreateInfo(examToCreateInfoDto: ExamToCreateInfoDto) {
    const examIds = examToCreateInfoDto.examIds;
    const parts = await this.prisma.part.findMany({
      where: {
        examId: { in: examIds },
      },
      select: {
        type: true,
        questions: {
          select: {
            id: true,
          },
        },
      },
    });
    const questionInfos = parts.reduce((preValue, curValue) => {
      const questionInfoFind = preValue.find(
        (questionInfo) => questionInfo.type === curValue.type,
      );
      if (questionInfoFind) {
        questionInfoFind.questions = questionInfoFind.questions.concat(
          curValue.questions,
        );
        return preValue;
      }
      return [...preValue, curValue];
    }, [] as QuestionInfos[]);
    return {
      questionInfos: questionInfos.map((questionInfo) => ({
        type: questionInfo.type,
        questions: questionInfo.questions.map((question) => question.id),
      })),
    };
  }
  async createExamAuto(
    ownerId: number,
    examsAutoCreatedDto: ExamsAutoCreatedDto,
  ) {
    const examsCreatedPromise = examsAutoCreatedDto.exams.map(async (exam) => {
      const { parts, ...newExam } = exam;
      const examCreated = await this.prisma.exam.create({
        data: {
          ownerId,
          isOriginal: false,
          ...newExam,
        },
      });

      const partsCreatedPromise = parts.map(async (part) => {
        return await this.prisma.part.create({
          data: {
            ...part,
            examId: examCreated.id,
          },
        });
      });

      const partsCreated = await Promise.all(partsCreatedPromise);

      return { ...examCreated, parts: partsCreated };
    });
    const exams = await Promise.all(examsCreatedPromise);
    return { exams };
  }

  async getResult(resultId: number, userId: number) {
    const result = await this.prisma.userCompleteExam.findFirst({
      where: { id: resultId },
    });
    if (result.userId !== userId) {
      throw new ForbiddenException();
    }
    return result;
  }

  async deleteResult(resultId: number, userId: number) {
    const result = await this.prisma.userCompleteExam.findFirst({
      where: { id: resultId },
    });
    if (result.userId !== userId) {
      throw new ForbiddenException();
    }
    return this.prisma.userCompleteExam.delete({ where: { id: resultId } });
  }

  uploadRaw(documentFile: Express.Multer.File) {
    return this.cloudinary.uploadFile(
      documentFile,
      {
        folderName: 'exam/passwordDoc',
      },
      'raw',
    );
  }
}
