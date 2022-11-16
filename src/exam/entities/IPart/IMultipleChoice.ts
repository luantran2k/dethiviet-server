import IMultipleChoiceQuestion from '../IQuestion/IMultipleChoice';
import IPart from './IPart';

export default interface IMultipleChoicePart extends IPart {
  questions: IMultipleChoiceQuestion[];
  numberOfAnswers?: number;
}
