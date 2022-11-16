import IMultipleChoicePart from '../entities/IPart/IMultipleChoice';
import IPart, { PartType } from '../entities/IPart/IPart';
import PartEntity from '../entities/part.entity';

export class CreateExamDto {
  id?: number;
  ownerId: number;
  title: string;
  isPublic: boolean;
  year: number;
  time: number;
  description?: string;
  subjectName?: string;
  grade?: string;
  schoolName?: string;
  parts?: PartEntity[];
}
