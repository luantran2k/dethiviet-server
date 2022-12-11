import { ExamEntity } from './../exam/entities/exam.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('avatar')
  getAvatar() {
    return this.usersService.getRandomAvatar();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getInfo(+id);
  }

  @Get(':id/exams/own')
  getOwnExams(
    @Param('id') id: string,
    @Query('userRequestId') userRequestId: string,
  ) {
    return this.usersService.getOwnExams(+id, +userRequestId);
  }

  @Get(':id/exams/completed')
  getCompletedExams(@Param('id') id: string) {
    return this.usersService.getCompletedExams(+id);
  }

  @Get(':id/exams/favorite')
  getFavoriteExams(@Param('id') id: string) {
    return this.usersService.getFavoriteExams(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
