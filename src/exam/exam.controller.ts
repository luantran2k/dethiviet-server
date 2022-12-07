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
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';
import { JwtPayload } from 'src/auth/accessToken.strategy';
import CompleteExamDto from './dto/completed-exam.dto';
import ExamsAutoCreatedDto from './dto/create-exam-auto.dto';
import ExamAutoCreatedDto from './dto/create-exam-auto.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import ExamToCreateInfoDto from './dto/exam-to-create-info.dto';
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

  @Get('/index')
  @ApiResponse({ type: ExamEntity, isArray: true })
  getExamsIndexPage() {
    return this.examService.getExamsIndexPage();
  }

  @Post('exam-to-create-info')
  getExamToCreateInfo(@Body() examToCreateInfoDto: ExamToCreateInfoDto) {
    return this.examService.getExamToCreateInfo(examToCreateInfoDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/create-auto')
  createExamAuto(@Body() examsAutoCreatedDto: ExamsAutoCreatedDto, @Req() req) {
    const user: JwtPayload = req.user;
    return this.examService.createExamAuto(+user.sub, examsAutoCreatedDto);
  }

  @Post('completed')
  @UseGuards(AccessTokenGuard)
  completedExam(@Body() completeExamEto: CompleteExamDto, @Req() req) {
    const user: JwtPayload = req.user;
    return this.examService.completedExam(+user.sub, completeExamEto);
  }

  @Get('result/:resultId')
  @UseGuards(AccessTokenGuard)
  getResult(@Param('resultId') resultId: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.examService.getResult(+resultId);
  }
  //@UseGuards(AccessTokenGuard)
  @Get(':id')
  @ApiResponse({ type: ExamEntity })
  findOne(
    @Param('id') id: string,
    @Query('userId') userId?: string,
    @Query('includePart', new DefaultValuePipe(false), ParseBoolPipe)
    includePart?: boolean,
    @Query('includeOwner', new DefaultValuePipe(false), ParseBoolPipe)
    includeOwner?: boolean,
    @Query('withRelatedExams', new DefaultValuePipe(false), ParseBoolPipe)
    withRelatedExams?: boolean,
    @Query('withAnswer', new DefaultValuePipe(true), ParseBoolPipe)
    withAnswer?: boolean,
  ) {
    return this.examService.findOne(+id, {
      userId: +userId,
      includePart,
      includeOwner,
      withRelatedExams,
      withAnswer,
    });
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

  @Post(':examId/favorite')
  addToFavouriteExam(
    @Param('examId') examId: string,
    @Query('userId') userId: string,
  ) {
    return this.examService.addFavoriteExam(+examId, +userId);
  }

  @Delete(':examId/favorite')
  delteFavouriteExam(
    @Param('examId') examId: string,
    @Query('userId') userId: string,
  ) {
    return this.examService.deleteFavoriteExam(+examId, +userId);
  }
}
