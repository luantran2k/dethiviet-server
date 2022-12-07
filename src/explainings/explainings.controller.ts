import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExplainingsService } from './explainings.service';
import { CreateExplainingDto } from './dto/create-explaining.dto';
import { UpdateExplainingDto } from './dto/update-explaining.dto';

@Controller('explainings')
export class ExplainingsController {
  constructor(private readonly explainingsService: ExplainingsService) {}

  @Post()
  create(@Body() createExplainingDto: CreateExplainingDto) {
    return this.explainingsService.create(createExplainingDto);
  }

  @Get()
  findAll() {
    return this.explainingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.explainingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExplainingDto: UpdateExplainingDto) {
    return this.explainingsService.update(+id, updateExplainingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.explainingsService.remove(+id);
  }
}
