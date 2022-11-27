import { PartialType } from '@nestjs/swagger';
import { ExamEntity } from '../entities/exam.entity';

export default class CompleteExamDto extends PartialType(ExamEntity) {
  userId: number;
}
