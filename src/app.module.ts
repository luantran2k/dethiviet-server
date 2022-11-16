import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamModule } from './exam/exam.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ExamModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
