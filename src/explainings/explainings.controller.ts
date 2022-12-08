import { JwtPayload } from 'src/auth/accessToken.strategy';
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
import { ExplainingsService } from './explainings.service';
import { CreateExplainingDto } from './dto/create-explaining.dto';
import { UpdateExplainingDto } from './dto/update-explaining.dto';
import { AccessTokenGuard } from 'src/auth/accessToken.guard';

@Controller('explainings')
export class ExplainingsController {
  constructor(private readonly explainingsService: ExplainingsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  create(@Body() createExplainingDto: CreateExplainingDto, @Req() req) {
    const user: JwtPayload = req.user;
    return this.explainingsService.create(+user.sub, createExplainingDto);
  }

  @Get()
  findAll() {
    return this.explainingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.explainingsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  update(
    @Param('id') id: string,
    @Body() updateExplainingDto: UpdateExplainingDto,
    @Req() req,
  ) {
    const user: JwtPayload = req.user;
    return this.explainingsService.update(+id, +user.sub, updateExplainingDto);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  remove(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.explainingsService.remove(+id, +user.sub);
  }

  @Patch(':id/upVote')
  @UseGuards(AccessTokenGuard)
  upVote(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.explainingsService.upVote(+id, +user.sub);
  }
  @Patch(':id/downVote')
  @UseGuards(AccessTokenGuard)
  downVote(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.explainingsService.downVote(+id, +user.sub);
  }
  @Patch(':id/removeUpVote')
  @UseGuards(AccessTokenGuard)
  removeUpVote(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.explainingsService.removeUpVote(+id, +user.sub);
  }
  @Patch(':id/removeDownVote')
  @UseGuards(AccessTokenGuard)
  removeDownVote(@Param('id') id: string, @Req() req) {
    const user: JwtPayload = req.user;
    return this.explainingsService.removeDownVote(+id, +user.sub);
  }
}
