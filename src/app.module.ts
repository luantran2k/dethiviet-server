import { Module } from '@nestjs/common';
import { AnswersModule } from './answers/answers.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ExamModule } from './exam/exam.module';
import { ExplainingsModule } from './explainings/explainings.module';
import { PartsModule } from './parts/parts.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuestioningsModule } from './questionings/questionings.module';
import { QuestionsModule } from './questions/questions.module';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ExamModule,
    PrismaModule,
    CloudinaryModule,
    AuthModule,
    UsersModule,
    AnswersModule,
    QuestionsModule,
    PartsModule,
    QuestioningsModule,
    ExplainingsModule,
    ReportsModule,
    MailModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
