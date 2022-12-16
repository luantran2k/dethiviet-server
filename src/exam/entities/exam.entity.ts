import { Exam } from '@prisma/client';
import PartEntity from 'src/parts/entities/part.entity';

export class ExamEntity implements Exam {
  isSuggest: boolean;
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
  documentUrl: string;
  createdAt: Date;
  updatedAt: Date;
  securityCode: string;
  isOriginal: boolean;
  allowedUserId: number[];
  parts?: PartEntity[];
}
