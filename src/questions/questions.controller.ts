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
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { query } from 'express';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(+id);
  }

  @Patch(':id/audio')
  @UseInterceptors(FileInterceptor('questionAudio'))
  updateQuestionAudio(
    @UploadedFile() questionAudio: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (questionAudio)
      return this.questionsService.updateQuesitonAudio(+id, questionAudio);
    return { message: 'Lỗi trong quá trình tải file' };
  }

  @Delete(':id/audio')
  deleteQuestionAudio(@Param('id') id: string) {
    return this.questionsService.deleteQuesitonAudio(+id);
  }

  @Post(':id/image')
  @UseInterceptors(FilesInterceptor('questionImages'))
  addQuestionImage(
    @Param('id') id: string,
    @UploadedFiles() questionImages: Array<Express.Multer.File>,
  ) {
    return this.questionsService.addQuestionImages(+id, questionImages);
  }

  @Delete(':id/image')
  deleteQuestionImage(@Param('id') id: string, @Query('url') url: string) {
    return this.questionsService.deleteQuestionImage(+id, url);
  }
}
