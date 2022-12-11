import { Transform, Type } from 'class-transformer';

export class CreateExamDto {
  @Type(() => Number)
  ownerId: number;
  title: string;
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
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
  securityCode?: string;
}
