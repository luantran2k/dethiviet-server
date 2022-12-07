import { Injectable } from '@nestjs/common';
import { CreateExplainingDto } from './dto/create-explaining.dto';
import { UpdateExplainingDto } from './dto/update-explaining.dto';

@Injectable()
export class ExplainingsService {
  create(createExplainingDto: CreateExplainingDto) {
    return 'This action adds a new explaining';
  }

  findAll() {
    return `This action returns all explainings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} explaining`;
  }

  update(id: number, updateExplainingDto: UpdateExplainingDto) {
    return `This action updates a #${id} explaining`;
  }

  remove(id: number) {
    return `This action removes a #${id} explaining`;
  }
}
