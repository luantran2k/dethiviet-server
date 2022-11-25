import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('parts')
@Controller('parts')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  create(@Body() createPartDto: CreatePartDto) {
    return this.partsService.create(createPartDto);
  }

  @Get()
  findAll() {
    return this.partsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return this.partsService.update(+id, updatePartDto);
  }
  @Patch(':id/audio')
  @UseInterceptors(FileInterceptor('partAudio'))
  updateQuestionAudio(
    @UploadedFile() partAudio: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (partAudio) return this.partsService.updatePartAudio(+id, partAudio);
    return { message: 'Lỗi trong quá trình tải file' };
  }

  @Delete(':id/audio')
  deleteQuestionAudio(@Param('id') id: string) {
    return this.partsService.deletePartAudio(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partsService.remove(+id);
  }
}
