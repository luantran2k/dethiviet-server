import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ExamModule } from './exam/exam.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AnswersModule } from './answers/answers.module';
import { QuestionsModule } from './questions/questions.module';
import { PartsModule } from './parts/parts.module';
import { QuestioningsModule } from './questionings/questionings.module';
import { ExplainingsModule } from './explainings/explainings.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
