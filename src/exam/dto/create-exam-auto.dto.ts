import { CreatePartDto } from './../../parts/dto/create-part.dto';
import { PartialType } from '@nestjs/mapped-types';
import { CreateExamDto } from './create-exam.dto';

export class PartCreatedAuto extends CreatePartDto {
  questionIds: number[];
}

export class ExamAutoCreatedDto extends CreateExamDto {
  parts: PartCreatedAuto[];
}
export default class ExamsAutoCreatedDto {
  exams: ExamAutoCreatedDto[];
}
