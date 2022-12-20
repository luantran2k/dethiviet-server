import { PrismaModule } from './../prisma/prisma.module';
import { Prisma } from '@prisma/client';
import { ExamModule } from './../exam/exam.module';
import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { ReportsModule } from 'src/reports/reports.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UsersModule, ExamModule, ReportsModule, PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
