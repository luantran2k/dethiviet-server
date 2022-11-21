import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { use } from 'passport';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: { ...createUserDto, profileImg: await this.getRandomAvatar() },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findFirst({ where: { id } });
  }

  findByUsername(username: string) {
    return this.prisma.user.findFirst({ where: { username } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }

  async getRandomAvatar() {
    const fileInfo = await this.cloudinary.getAllFileInFolder(
      'dethiviet/image/avatar/default',
      {
        resourceType: 'image',
      },
    );
    const numberOfFiles = fileInfo.total_count;
    const randomNumber = Math.floor(Math.random() * numberOfFiles);
    return fileInfo.resources[randomNumber].url;
  }
}
