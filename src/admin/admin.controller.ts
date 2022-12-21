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
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common/decorators';
import { report } from 'process';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AccessTokenGuard)
export class AdminController {
  constructor(private readonly adminSerivce: AdminService) {}
  @Get('dashboard')
  getDashboardInfo(@Req() req) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.getDashboardInfo();
  }

  @Get('users')
  getUsersInfo(
    @Req() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('search') search?: string,
  ) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.getUsersInfo(page, search);
  }

  @Post('users/remove')
  deleteUsers(@Req() req, @Body() body: { ids: number[] }) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.removeUsers(body.ids);
  }

  @Post('users/mail')
  sendMail(
    @Req() req,
    @Body() body: { ids: number[]; title: string; content: string },
  ) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.sendMail(body);
  }

  @Get('exams')
  getExamsInfo(
    @Req() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('search') search?: string,
  ) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.getExamsInfo(page, search);
  }

  @Post('exams/remove')
  deleteExams(@Req() req, @Body() body: { ids: number[] }) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.removeExams(body.ids);
  }

  @Get('reports')
  getReportsInfo(
    @Req() req,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('search') search?: string,
    @Query('state') state?: string,
  ) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.getReportsInfo(page, search, state);
  }

  @Patch('reports/update-state')
  updateReportState(@Req() req, @Body() body: { id: number; state: string }) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.updateReportState(body);
  }
}
