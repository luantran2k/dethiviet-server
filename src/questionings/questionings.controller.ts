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
} from '@nestjs/common';
import { QuestioningsService } from './questionings.service';
import { CreateQuestioningDto } from './dto/create-questioning.dto';
import { UpdateQuestioningDto } from './dto/update-questioning.dto';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';

@Controller('questionings')
export class QuestioningsController {
  constructor(private readonly questioningsService: QuestioningsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  create(@Body() createQuestioningDto: CreateQuestioningDto, @Req() req) {
    const user: JwtPayload = req.user;
    return this.questioningsService.create(+user.sub, createQuestioningDto);
  }

  @Get()
  findAll() {
    return this.questioningsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questioningsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestioningDto: UpdateQuestioningDto,
  ) {
    return this.questioningsService.update(+id, updateQuestioningDto);
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
