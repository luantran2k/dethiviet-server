import { Exam } from '@prisma/client';

export class ExamEntity implements Exam {
  id: number;
  ownerId: number;
  title: string;
  isPublic: boolean;
  duration: number;
  type: string;
  examName: string;
  date: Date;
  description: string;
  subjectName: string;
  grade: string;
  publishers: string;
  createdAt: Date;
  updatedAt: Date;
}
