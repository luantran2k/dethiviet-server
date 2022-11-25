import { Question } from '@prisma/client';
import AnswerEntity from 'src/answers/entities/answer.entity';

export default class QuestionEntity implements Question {
  id: number;
  partId: number;
  title: string;
  description: string;
  questionAudio: string;
  questionImages: string[];
  explain: string;
  answers?: AnswerEntity[];
}
