import { Module } from '@nestjs/common';
import { PartsService } from './parts.service';
import { PartsController } from './parts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { QuestionsService } from 'src/questions/questions.service';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [PartsController],
  providers: [PartsService, QuestionsService],
  exports: [PartsService],
})
export class PartsModule {}
