import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { use } from 'passport';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ExamEntity } from 'src/exam/entities/exam.entity';
import Ultis from 'src/Utils/Ultis';
import { Period } from 'src/types/type';

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

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    userRequestId?: number,
  ) {
    const { password, ...data } = updateUserDto;
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (userRequestId && user.id !== userRequestId) {
      throw new ForbiddenException(
        'Bạn không có quyền chỉnh sửa' + userRequestId + ' ' + user.id,
      );
    }
    if (password) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw new BadRequestException('Mật khẩu không đúng');
      }
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });
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
        createdAt: true,
        phone: true,
        role: true,
      },
    });
  }

  async getOwnExams(id: number, userRequestId?: number) {
    const exams = await this.prisma.exam.findMany({
      where: {
        ownerId: id,
        ...(id === userRequestId ? {} : { isPublic: true }),
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

  async countNewUser(period: Period = 'week') {
    const beginDate = Ultis.getBeginDate(period, new Date());
    return this.prisma.user.count({
      where: {
        createdAt: {
          gte: beginDate,
        },
      },
    });
  }

  async aggregateUsers() {
    const usersByMonths: { createdAt: string; count: number }[] = await this
      .prisma.$queryRaw`
    SELECT
    DATE_TRUNC('month',"createdAt")
      AS  "createdAt",
    COUNT(id)::int AS count
    FROM "User"
    GROUP BY DATE_TRUNC('month',"createdAt");`;
    const data = usersByMonths
      .map((usersByMonth) => ({
        month: new Date(usersByMonth.createdAt).getMonth() + 1,
        count: usersByMonth.count,
      }))
      .sort((a, b) => a.month - b.month);
    return {
      label: 'Người dùng mới',
      data,
    };
  }

  removeUsers(ids: number[]) {
    return this.prisma.user.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
