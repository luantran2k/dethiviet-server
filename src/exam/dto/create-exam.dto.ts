import { Transform, Type } from 'class-transformer';

export class CreateExamDto {
  @Type(() => Number)
  ownerId: number;
  title: string;
  @Type(() => Boolean)
  isPublic?: boolean;
  @Type(() => Number)
  duration?: number;
  type?: string;
  examName?: string;
  @Type(() => Date)
  date?: Date;
  description?: string;
  subjectName?: string;
  grade?: string;
  publishers?: string;
}
