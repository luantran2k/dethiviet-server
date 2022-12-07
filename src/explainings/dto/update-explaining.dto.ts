import { PartialType } from '@nestjs/swagger';
import { CreateExplainingDto } from './create-explaining.dto';

export class UpdateExplainingDto extends PartialType(CreateExplainingDto) {}
