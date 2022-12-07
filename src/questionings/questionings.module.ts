import { Module } from '@nestjs/common';
import { QuestioningsService } from './questionings.service';
import { QuestioningsController } from './questionings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuestioningsController],
  providers: [QuestioningsService],
})
export class QuestioningsModule {}
