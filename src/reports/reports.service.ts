import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/prisma/prisma.service';
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

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
