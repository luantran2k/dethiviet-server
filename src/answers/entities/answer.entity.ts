import { Answer } from '@prisma/client';

export default class AnswerEntity implements Answer {
  createdAt: Date;
  updatedAt: Date;
  id: number;
  clientId: number;
  questionId: number;
  value: string;
  isTrue: boolean;
}
