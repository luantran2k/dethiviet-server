import { PrismaModule } from './../prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
