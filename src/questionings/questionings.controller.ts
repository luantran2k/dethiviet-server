import { JwtPayload } from './../auth/accessToken.strategy';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { QuestioningsService } from './questionings.service';
import { CreateQuestioningDto } from './dto/create-questioning.dto';
import { UpdateQuestioningDto } from './dto/update-questioning.dto';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('questionings')
export class QuestioningsController {
  constructor(private readonly questioningsService: QuestioningsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audioFile', maxCount: 1 },
      { name: 'imageFiles', maxCount: 10 },
    ]),
  )
  create(
    @Body() createQuestioningDto: CreateQuestioningDto,
    @Req() req,
    @UploadedFiles()
    files: {
      audioFile?: Express.Multer.File[];
      imageFiles?: Express.Multer.File[];
    },
  ) {
    const user: JwtPayload = req.user;
    return this.questioningsService.create(
      +user.sub,
      createQuestioningDto,
      files,
    );
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
  ) {
    return this.questioningsService.findAll({ page, search, tag });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questioningsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  update(
    @Param('id') id: string,
    @Body() updateQuestioningDto: UpdateQuestioningDto,
    @Req() req,
  ) {
    const user: JwtPayload = req.user;
    return this.questioningsService.update(
      +id,
      +user.sub,
      updateQuestioningDto,
    );
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.questioningsService.remove(+id, +user.sub);
  }

  @Patch(':id/upVote')
  @UseGuards(AccessTokenGuard)
  upVote(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.questioningsService.upVote(+id, +user.sub);
  }
  @Patch(':id/downVote')
  @UseGuards(AccessTokenGuard)
  downVote(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.questioningsService.downVote(+id, +user.sub);
  }

  @Patch(':id/removeUpVote')
  @UseGuards(AccessTokenGuard)
  removeUpVote(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.questioningsService.removeUpVote(+id, +user.sub);
  }
  @Patch(':id/removeDownVote')
  @UseGuards(AccessTokenGuard)
  removeDownVote(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.questioningsService.removeDownVote(+id, +user.sub);
  }
}
