import { Answer } from '@prisma/client';

export default class AnswerEntity implements Answer {
  id: number;
  questionId: number;
  value: string;
  isTrue: boolean;
}

export class AnswerEntityWithCheck extends AnswerEntity {
  isAnswerFail?: boolean;
}
