import { PrismaModule } from './../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
