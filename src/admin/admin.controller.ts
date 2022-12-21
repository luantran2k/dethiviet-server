import {
  Controller,
  DefaultValuePipe,
  ForbiddenException,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import {
  Body,
  Delete,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common/decorators';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';
import { AdminService } from './admin.service';

@Controller('admin')
// @UseGuards(AccessTokenGuard)
export class AdminController {
  constructor(private readonly adminSerivce: AdminService) {}
  @Get('dashboard')
  getDashboardInfo(@Req() req) {
    // if (!req.user.role.some((curRole) => curRole === 'admin')) {
    //   throw new ForbiddenException();
    // }
    return this.adminSerivce.getDashboardInfo();
  }

  @Get('users')
  getUsersInfo(
    @Req() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('search') search?: string,
  ) {
    return this.adminSerivce.getUsersInfo(page, search);
  }

  @Post('users/remove')
  deleteUsers(@Body() body: { ids: number[] }) {
    return this.adminSerivce.removeUsers(body.ids);
  }

  @Post('users/mail')
  sendMail(@Body() body: { ids: number[]; title: string; content: string }) {
    return this.adminSerivce.sendMail(body);
  }

  @Get('exams')
  getExamsInfo(
    @Req() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('search') search?: string,
  ) {
    return this.adminSerivce.getExamsInfo(page, search);
  }

  @Post('exams/remove')
  deleteExams(@Body() body: { ids: number[] }) {
    return this.adminSerivce.removeExams(body.ids);
  }
}
