import IMultiSelectQuestion from '../../questions/interfaces/IMultiSelect';
import IPart from './IPart';

export default interface IMultiSelectPart extends IPart {
  questions: IMultiSelectQuestion[];
  numberOfAnswers?: number;
}
