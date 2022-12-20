import { ReportsService } from './../reports/reports.service';
import { UsersService } from './../users/users.service';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ExamService } from 'src/exam/exam.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly exams: ExamService,
    private readonly reports: ReportsService,
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
}
