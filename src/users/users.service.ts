import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { use } from 'passport';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ExamEntity } from 'src/exam/entities/exam.entity';

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
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        profileImg: true,
        name: true,
        email: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findFirst({
      where: { id },
    });
  }

  findByUsername(username: string) {
    return this.prisma.user.findFirst({ where: { username } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email },
      select: { email: true },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  updateByEmail(email: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({ where: { email }, data: updateUserDto });
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

  getInfo(id: number) {
    return this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        profileImg: true,
        email: true,
      },
    });
  }

  async getOwnExams(id: number) {
    const exams = await this.prisma.exam.findMany({
      where: {
        ownerId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        documentUrl: true,
        grade: true,
        examName: true,
        subjectName: true,
      },
    });
    return { exams };
  }

  async getCompletedExams(id: number) {
    const exams = await this.prisma.userCompleteExam.findMany({
      where: {
        userId: id,
      },
      select: {
        id: true,
        exam: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            documentUrl: true,
            grade: true,
            examName: true,
            subjectName: true,
          },
        },
      },
    });
    return {
      exams: exams.map((exam) => ({ ...exam.exam, resultId: exam.id })),
    };
  }

  async getFavoriteExams(id: number) {
    const exams = await this.prisma.userFavoriteExam.findMany({
      where: {
        userId: id,
      },
      select: {
        exam: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            documentUrl: true,
            grade: true,
            examName: true,
            subjectName: true,
          },
        },
      },
    });
    return { exams: exams.map((exam) => exam.exam) };
  }
}
