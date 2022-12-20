import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { Req, UseGuards } from '@nestjs/common/decorators';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminSerivce: AdminService) {}
  @Get('dashboard')
  @UseGuards(AccessTokenGuard)
  getDashboardInfo(@Req() req) {
    if (!req.user.role.some((curRole) => curRole === 'admin')) {
      throw new ForbiddenException();
    }
    return this.adminSerivce.getDashboardInfo();
  }
}
