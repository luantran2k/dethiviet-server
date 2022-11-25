import { Part } from '@prisma/client';
import QuestionEntity from 'src/questions/entities/question.entity';

export default class PartEntity implements Part {
  id: number;
  examId: number;
  title: string;
  type: string;
  totalPoints: number;
  partAudio: string;
  description: string;
  numberOfAnswers: number;
  questions?: QuestionEntity[];
}
