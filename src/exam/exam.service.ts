import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PartsService } from 'src/parts/parts.service';
import QuestionEntity from 'src/questions/entities/question.entity';
import QuestionTypeDatas from 'src/questions/QuestionTypes';
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
    const password = Ultis.getRandomString(10);
    data.securityCode = password;
    if (documentFile) {
      const documentUpload = await this.upLoadDocument(documentFile, password);
      if (documentUpload?.secure_url) {
        return this.prisma.exam.create({
          data: { ...createExamDto, documentUrl: documentUpload.secure_url },
        });
      }
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
        documentUrl: true,
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
      securityCode,
    }: {
      userId?: number;
      includePart?: boolean;
      includeOwner?: boolean;
      withRelatedExams?: boolean;
      withAnswer?: boolean;
      securityCode?: string;
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
                answers: {
                  select: {
                    id: true,
                    isTrue: withAnswer || false,
                    value: true,
                  },
                },
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
    const isAllowed = exam.allowedUserId.some((allowId) => allowId === userId);
    if (
      exam.isPublic === true ||
      userId === exam.ownerId ||
      isAllowed ||
      exam.securityCode === securityCode
    ) {
      if (!isAllowed) {
        await this.prisma.exam.update({
          where: { id },
          data: { allowedUserId: { push: userId } },
        });
      }
      return {
        ...result,
        isFavorited: UserFavoriteExam[0]?.userId === userId ? true : false,
        relatedExams: withRelatedExams ? relatedExams : undefined,
      };
    }
    if (exam.isPublic === false && userId !== exam.ownerId) {
      if (securityCode && exam.securityCode !== securityCode) {
        throw new BadRequestException('Mã xác minh không đúng');
      }
    }
    return {
      id: undefined,
      documentUrl: undefined,
      parts: undefined,
      isOriginal: undefined,
      mess: 'need password',
    };
  }

  update(id: number, updateExamDto: UpdateExamDto) {
    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }
  async removeDocument(url: string) {
    const publicId = Ultis.getPublicId(url);
    return this.cloudinary.removeFile(publicId + '.pdf', 'raw');
  }
  async remove(id: number, userId: number) {
    const exam = await this.prisma.exam.findFirst({
      where: { id },
      include: {
        parts: {
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        },
      },
    });
    if (exam?.documentUrl) {
      const res = await this.removeDocument(exam.documentUrl);
    }
    if (exam?.parts && exam.parts.length > 0) {
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
      const documentUpload = await this.cloudinary.uploadFile(
        documentFile,
        {
          folderName: 'exam/documents',
        },
        'raw',
      );
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
        documentUrl: true,
        securityCode: true,
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
            let countCorrectAnswer = 0;
            const answers: AnswerEntityWithCheck[] = question.answers.map(
              (answer, answerIndex) => {
                const resultAnswer = resultQuestion?.answers[answerIndex];
                if (resultAnswer?.isTrue == Boolean(answer?.isTrue)) {
                  if (resultAnswer.isTrue == true) {
                    countCorrectAnswer++;
                  }
                  return {
                    ...answer,
                    isAnswerFail: false,
                  };
                } else if (resultAnswer == undefined) {
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
            let isQuestionTrue = false;
            switch (part.type) {
              case QuestionTypeDatas.MultipleChoice.value: {
                if (
                  !answers.some((answer) => answer.isAnswerFail == true) &&
                  countCorrectAnswer > 0
                ) {
                  isQuestionTrue = true;
                  break;
                }
                isQuestionTrue = false;
                break;
              }
              case QuestionTypeDatas.MultiSelect.value: {
                if (
                  !answers.some((answer) => answer.isAnswerFail == true) &&
                  answers.filter((answer) => answer.isTrue == true).length ===
                    countCorrectAnswer &&
                  countCorrectAnswer > 0
                ) {
                  isQuestionTrue = true;
                  break;
                }
                isQuestionTrue = false;
                break;
              }
              default: {
                break;
              }
            }

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
      isSuggest: true,
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

    const suggestedExamPromise = this.prisma.exam.findMany({
      where: { isSuggest: true },
      take: quantity,
      select: selectExam,
    });

    const [lastestExams, suggestedExam, popularMonthExams] = await Promise.all([
      lastestExamsPromise,
      suggestedExamPromise,
      Promise.all(popularMonthExamsPromise),
    ]);
    return {
      lastestExams,
      suggestedExam,
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

  // uploadRaw(documentFile: Express.Multer.File) {
  //   return this.cloudinary.uploadFile(
  //     documentFile,
  //     {
  //       folderName: 'exam/passwordDoc',
  //     },
  //     'raw',
  //   );
  // }

  async upLoadDocument(documentFile: Express.Multer.File, password) {
    const inputFile = documentFile.path;
    const outputFile = inputFile.replace('input', 'output');
    let documentUpload = undefined;
    Ultis.setPassword(inputFile, outputFile, password);
    documentUpload = await this.cloudinary.uploadFileOnDisk(outputFile, 'raw', {
      folder: 'dethiviet/exam/documents',
    });
    Ultis.removeFile(inputFile);
    Ultis.removeFile(outputFile);
    return documentUpload;
  }

  async changeSecurityCode(id) {
    const exam = await this.prisma.exam.findFirst({ where: { id } });
    const dataUpdate: UpdateExamDto = {};
    const newSecurityCode = Ultis.getRandomString(10);
    if (exam.documentUrl) {
      const inputPath = await Ultis.downloadFileToDisk(
        exam.documentUrl,
        join(__dirname, '../', '../', 'uploads', 'pdfs', 'input'),
        'pdf',
      );
      const outputPath = Ultis.changePasswordFile(
        inputPath,
        exam.securityCode,
        newSecurityCode,
      );
      const response = await this.cloudinary.uploadFileOnDisk(
        outputPath,
        'raw',
        {
          folder: 'dethiviet/exam/documents',
        },
      );
      await this.removeDocument(exam.documentUrl);
      Ultis.removeFile(inputPath);
      Ultis.removeFile(outputPath);
      if (response.secure_url) {
        dataUpdate.documentUrl = response.secure_url;
      }
    }
    dataUpdate.securityCode = newSecurityCode;
    return this.prisma.exam.update({
      where: { id },
      data: dataUpdate,
      select: {
        securityCode: true,
        documentUrl: true,
      },
    });
  }
  async suggest(examId, userId) {
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    if (!user.role.some((role) => role === 'admin')) {
      throw new ForbiddenException('Bạn không có quyền đề xuất');
    }
    return this.prisma.exam.update({
      where: { id: examId },
      data: { isSuggest: true },
    });
  }
  async removeSuggest(examId, userId) {
    const user = await this.prisma.user.findFirst({ where: { id: userId } });
    if (!user.role.some((role) => role === 'admin')) {
      throw new ForbiddenException('Bạn không có quyền đề xuất');
    }
    return this.prisma.exam.update({
      where: { id: examId },
      data: { isSuggest: false },
    });
  }
}
