import IAnswer from './IAnswer';

export default interface IMultipleChoiceAnswer extends IAnswer {
  isTrue?: boolean;
}
