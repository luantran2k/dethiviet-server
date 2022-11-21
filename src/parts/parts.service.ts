import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';

@Injectable()
export class PartsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPartDto: CreatePartDto) {
    return this.prisma.part.create({ data: createPartDto });
  }

  findAll() {
    return this.prisma.part.findMany();
  }

  findOne(id: number) {
    return this.prisma.part.findFirst({ where: { id } });
  }

  update(id: number, updatePartDto: UpdatePartDto) {
    return this.prisma.part.update({ where: { id }, data: updatePartDto });
  }

  remove(id: number) {
    return this.prisma.part.delete({ where: { id } });
  }
}
