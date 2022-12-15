import { Module } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PartsService } from 'src/parts/parts.service';
import { PartsModule } from './../parts/parts.module';
import { PrismaModule } from './../prisma/prisma.module';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';

@Module({
  imports: [PrismaModule, AuthModule, CloudinaryModule, PartsModule],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {
  constructor() {
    const inputPath = join(__dirname, '..', '..', 'uploads', 'pdfs', 'input');
    const outputPath = inputPath.replace('input', 'output');

    if (!existsSync(inputPath)) {
      mkdirSync(inputPath, { recursive: true });
    }
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, { recursive: true });
    }
  }
}
