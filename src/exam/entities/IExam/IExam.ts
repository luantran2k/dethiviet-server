import PartEntity from 'src/parts/entities/part.entity';
import { PartType } from '../../../parts/interfaces/IPart';

export default interface IExam {
  id?: number;
  ownerId?: number;
  title?: string;
  isPublic?: boolean;
  duration?: number;
  type?: string;
  examName?: string;
  date?: Date;
  description?: string;
  subjectName?: string;
  grade?: string;
  publishers?: string;
  documentUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  securityCode?: string;
  isOriginal?: boolean;
  parts?: PartEntity[];
}
