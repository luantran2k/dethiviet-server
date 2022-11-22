export class CreatePartDto {
  examId: number;
  title: string;
  type: string;
  totalPoints: number;
  description?: string;
  numberOfQuestions?: number;
  numberOfAnswers?: number;
}
