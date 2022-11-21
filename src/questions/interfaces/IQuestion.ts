import { AnswerType } from '../../answers/interfaces/IAnswer';
import IMultipleChoiceQuestion from './IMultipleChoice';
import IMultiSelectQuestion from './IMultiSelect';

export type QuestionType = IMultipleChoiceQuestion | IMultiSelectQuestion;

export default interface IQuestion {
  id?: number;
  title: string;
  description?: string;
  explain?: string;
  answers?: AnswerType;
}
