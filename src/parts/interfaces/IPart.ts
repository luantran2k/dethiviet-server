import { QuestionType } from '../../questions/interfaces/IQuestion';
import IMultipleChoicePart from './IMultipleChoice';
import IMultiSelectPart from './IMultiSelect';

export type PartType = IMultipleChoicePart | IMultiSelectPart;
export default interface IPart {
  id?: number;
  title: string;
  description?: string;
  type: string;
  totalPoints: number;
  questions?: QuestionType[];
}
