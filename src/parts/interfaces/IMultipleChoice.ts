import IMultipleChoiceQuestion from '../../questions/interfaces/IMultipleChoice';
import IPart from './IPart';

export default interface IMultipleChoicePart extends IPart {
  questions: IMultipleChoiceQuestion[];
  numberOfAnswers?: number;
}
