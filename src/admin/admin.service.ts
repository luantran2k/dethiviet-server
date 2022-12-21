import { use } from 'passport';
import { ReportsService } from './../reports/reports.service';
import { UsersService } from './../users/users.service';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ExamService } from 'src/exam/exam.service';
import { MailService } from 'src/mail/mail.service';
import { async } from 'rxjs';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly exams: ExamService,
    private readonly reports: ReportsService,
    private readonly mail: MailService,
  ) {}
  async getDashboardInfo() {
    const newUserPromise = await this.users.countNewUser();
    const newExamPromise = await this.exams.countNewExams();
    const newCompletedExamsPromise = await this.exams.countCompletedExams();
    const newReportPromise = await this.reports.countNewReport();
    const aggregateUserPromise = await this.users.aggregateUsers();
    const aggregateExamsPromise = await this.exams.aggregateExams();
    const aggregateCompletedExamsPromise =
      await this.exams.aggregateCompletedExams();
    const mostCompletedExamsPromise = await this.exams.mostCompletedExams();
    const [
      newUser,
      newExam,
      newCompletedExams,
      newReport,
      aggregateUser,
      aggregateExams,
      aggregateCompletedExams,
      mostCompletedExams,
    ] = await Promise.all([
      newUserPromise,
      newExamPromise,
      newCompletedExamsPromise,
      newReportPromise,
      aggregateUserPromise,
      aggregateExamsPromise,
      aggregateCompletedExamsPromise,
      mostCompletedExamsPromise,
    ]);
    return {
      newUser,
      newExam,
      newCompletedExams,
      newReport,
      aggregateUser,
      aggregateExams,
      aggregateCompletedExams,
      mostCompletedExams,
    };
  }

  async getUsersInfo(page: number, search?: string) {
    const quantity = 20;
    let totalUsersPromise;
    if (page === 0) {
      totalUsersPromise = this.prisma.user.count();
    }
    const usersPromise = this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        profileImg: true,
        createdAt: true,
      },
      where: search
        ? {
            OR: [
              {
                username: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : undefined,
      take: quantity,
      skip: quantity * page,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const [totalUser, users] = await Promise.all([
      totalUsersPromise,
      usersPromise,
    ]);
    return {
      users,
      totalPages: totalUser ? Math.ceil(totalUser / quantity) : undefined,
    };
  }

  async removeUsers(ids: number[]) {
    return this.users.removeUsers(ids);
  }

  async sendMail({
    ids,
    title,
    content,
  }: {
    ids: number[];
    title: string;
    content: string;
  }) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        username: true,
        email: true,
      },
    });
    const validUsers = users.filter((user) => user.email);
    const sendMailPromise = validUsers.map((user) => {
      return this.mail.sendEmail({
        email: user.email,
        subject: title,
        content,
      });
    });
    return await Promise.all(sendMailPromise);
  }

  async getExamsInfo(page: number, search?: string) {
    const quantity = 20;
    let totalExamsPromise;
    if (page === 0) {
      totalExamsPromise = this.prisma.exam.count();
    }
    const examsPromise = this.prisma.exam.findMany({
      select: {
        id: true,
        title: true,
        isPublic: true,
        securityCode: true,
        duration: true,
        type: true,
        examName: true,
        subjectName: true,
        documentUrl: true,
        isOriginal: true,
        isSuggest: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      where: search
        ? {
            OR: [
              {
                title: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                subjectName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                examName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : undefined,
      take: quantity,
      skip: quantity * page,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const [totalExams, exams] = await Promise.all([
      totalExamsPromise,
      examsPromise,
    ]);
    return {
      exams,
      totalPages: totalExams ? Math.ceil(totalExams / quantity) : undefined,
    };
  }

  async removeExams(ids: number[]) {
    return this.prisma.exam.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
