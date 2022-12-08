import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';
import { JwtPayload } from 'src/auth/accessToken.strategy';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body(new ValidationPipe({ transform: true }))
    createReportDto: CreateReportDto,
    @Req() req,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const user: JwtPayload = req.user;
    return this.reportsService.create(+user.sub, createReportDto, image);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('findByUser')
  @UseGuards(AccessTokenGuard)
  findByUser(@Req() req) {
    const user: JwtPayload = req.user;
    return this.reportsService.findByUser(+user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(+id, updateReportDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.reportsService.remove(+id, +user.sub);
  }
}
