import { PrismaModule } from 'src/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AnswersController],
  providers: [AnswersService],
})
export class AnswersModule {}
