import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { ExamEntity } from './entities/exam.entity';
import { ExamService } from './exam.service';

@ApiTags('exams')
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  @ApiCreatedResponse({ type: ExamEntity })
  @UseInterceptors(FileInterceptor('documentFile'))
  create(
    @Body(new ValidationPipe({ transform: true }))
    createExamDto: CreateExamDto,
    @UploadedFile() documentFile: Express.Multer.File,
  ) {
    return this.examService.create(createExamDto, documentFile);
  }

  @Get()
  @ApiResponse({ type: ExamEntity, isArray: true })
  findAll(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('quantity', new DefaultValuePipe(20), ParseIntPipe) quantity: number,
    @Query('title') title?: string,
    @Query('subjectName') subjectName?: string,
    @Query('year', new DefaultValuePipe(-1), ParseIntPipe) year?: number,
    @Query('grade') grade?: string,
  ) {
    if (year === -1) year = undefined;
    return this.examService.findAll(
      page,
      quantity,
      title,
      subjectName,
      year,
      grade,
    );
  }

  //@UseGuards(AccessTokenGuard)
  @Get(':id')
  @ApiResponse({ type: ExamEntity })
  findOne(
    @Param('id') id: string,
    @Query('includePart', new DefaultValuePipe(false), ParseBoolPipe)
    includePart?: boolean,
    @Query('includeOwner', new DefaultValuePipe(false), ParseBoolPipe)
    includeOwner?: boolean,
  ) {
    return this.examService.findOne(+id, includePart, includeOwner);
  }

  @Patch(':id')
  @ApiResponse({ type: ExamEntity })
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examService.update(+id, updateExamDto);
  }

  @Delete(':id')
  @ApiResponse({ type: ExamEntity })
  remove(@Param('id') id: string) {
    return this.examService.remove(+id);
  }
}
