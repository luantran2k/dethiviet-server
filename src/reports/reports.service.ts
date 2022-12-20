import { Injectable, ForbiddenException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Period } from 'src/types/type';
import Ultis from 'src/Utils/Ultis';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}
  async create(
    userId: number,
    createReportDto: CreateReportDto,
    image?: Express.Multer.File,
  ) {
    if (image) {
      const imageRes = await this.cloudinary.uploadFile(image, {
        folderName: 'report/images',
      });
      if (imageRes.secure_url) {
        createReportDto.image = imageRes.secure_url;
      }
    }
    return this.prisma.report.create({
      data: {
        ...createReportDto,
        userId,
      },
    });
  }

  findAll() {
    return `This action returns all reports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  async remove(id: number, userId: number) {
    const report = await this.prisma.report.findFirst({ where: { id } });
    const exam = await this.prisma.exam.findFirst({
      where: { id: report.examId },
      select: { ownerId: true },
    });
    if (exam?.ownerId !== userId) {
      throw new ForbiddenException();
    }
    if (report.image) {
      await this.cloudinary.removeFile(
        Ultis.getPublicId(report.image),
        'image',
      );
    }
    return this.prisma.report.delete({
      where: {
        id,
      },
    });
  }
  findByUser(userId: number) {
    return this.prisma.report.findMany({
      where: {
        exam: {
          ownerId: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImg: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
  countNewReport(period: Period = 'week') {
    const beginDate = Ultis.getBeginDate(period, new Date());
    return this.prisma.report.count({
      where: {
        examId: {
          equals: null,
        },
        createdAt: {
          gte: beginDate,
        },
      },
    });
  }
}
