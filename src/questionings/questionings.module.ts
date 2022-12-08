import { Module } from '@nestjs/common';
import { QuestioningsService } from './questionings.service';
import { QuestioningsController } from './questionings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [QuestioningsController],
  providers: [QuestioningsService],
})
export class QuestioningsModule {}
