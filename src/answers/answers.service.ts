import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';

@Injectable()
export class AnswersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createAnswerDto: CreateAnswerDto) {
    return this.prisma.answer.create({ data: createAnswerDto });
  }

  findAll() {
    return this.prisma.answer.findMany();
  }

  findOne(id: number) {
    return this.prisma.answer.findFirst({ where: { id } }).catch((e) => {
      console.log('ERROR: ', e);
      //throw new NotFoundException('Bài kiểm tra không tồn tại');
    });
  }

  update(id: number, updateAnswerDto: UpdateAnswerDto) {
    return this.prisma.answer.update({
      where: { id },
      data: updateAnswerDto,
    });
  }

  async updateManyTimes(updateAnswersDto: UpdateAnswerDto[]) {
    const answers = updateAnswersDto.map(async (answer) => {
      const { id, ...data } = answer;
      return this.prisma.answer.update({
        where: { id },
        data,
      });
    });
    return await Promise.all(answers);
  }

  remove(id: number) {
    return this.prisma.answer.delete({ where: { id } });
  }
}
