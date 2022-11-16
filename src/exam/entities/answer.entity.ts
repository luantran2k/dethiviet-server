import { Answer } from '@prisma/client';

export default class AnswerEntity implements Answer {
  id: number;
  clientId: number;
  questionId: number;
  value: string;
  isTrue: boolean;
}
