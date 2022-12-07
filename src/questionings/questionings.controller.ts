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
  remove(@Param('id') id: string) {
    return this.questioningsService.remove(+id);
  }
}
