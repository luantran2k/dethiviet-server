import { PartType } from '../IPart/IPart';

export default interface IExam {
  id?: number;
  title?: string;
  description?: string;
  ownerId?: string;
  isPublic?: boolean | 'true' | 'false';
  year?: number;
  subjectName?: string;
  grade?: string;
  schoolName?: string;
  time?: number;
  parts?: PartType[];
}
