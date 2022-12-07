import { PartialType } from '@nestjs/swagger';
import { CreateQuestioningDto } from './create-questioning.dto';

export class UpdateQuestioningDto extends PartialType(CreateQuestioningDto) {}
