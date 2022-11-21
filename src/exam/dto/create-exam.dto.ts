export class CreateExamDto {
  ownerId: number;
  title: string;
  isPublic?: boolean;
  duration?: number;
  type?: string;
  examName?: string;
  date?: Date;
  description?: string;
  subjectName?: string;
  grade?: string;
  publishers?: string;
}
