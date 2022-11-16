import IMultipleChoiceAnswer from './IMultipleChoice';
import IMultiSelectAnswer from './IMultiSelect';
export type AnswerType = IMultipleChoiceAnswer | IMultiSelectAnswer;
export default interface IAnswer {
  id?: number;
  value?: string | number;
}
