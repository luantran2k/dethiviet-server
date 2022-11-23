import { Question } from '@prisma/client';
import AnswerEntity from 'src/answers/entities/answer.entity';

export default class QuestionEntity implements Question {
  id: number;
  clientId: number;
  partId: number;
  title: string;
  description: string;
  explain: string;
  questionAudio: string;
  questionImages: string[];
  createdAt: Date;
  updatedAt: Date;
  answers: AnswerEntity[];
}
