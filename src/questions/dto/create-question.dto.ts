export class CreateQuestionDto {
  partId: number;
  title?: string;
  description?: string;
  explain?: string;
  numberOfAnswers?: number;
}
