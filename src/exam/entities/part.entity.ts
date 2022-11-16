import { Part } from '@prisma/client';
import QuestionEntity from './question.entity';

export default class PartEntity implements Part {
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
