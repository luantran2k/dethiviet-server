export class CreatePartDto {
  examId: number;
  title: string;
  type: string;
  totalPoints: number;
  description?: string;
  numberOfAnswers: number;
}
