import { Part } from '@prisma/client';
import QuestionEntity from 'src/questions/entities/question.entity';

export default class PartEntity implements Part {
  createdAt: Date;
  updatedAt: Date;
  id: number;
  clientId: number;
  examId: number;
  title: string;
  type: string;
  totalPoints: number;
  description: string;
  numberOfAnswers: number;
  questions: QuestionEntity[];
}
