import { Type } from 'class-transformer';

export class CreateReportDto {
  content: string;
  @Type(() => Number)
  examId?: number;
  image?: string;
}
