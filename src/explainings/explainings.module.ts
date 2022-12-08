import { Module } from '@nestjs/common';
import { ExplainingsService } from './explainings.service';
import { ExplainingsController } from './explainings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExplainingsController],
  providers: [ExplainingsService],
})
export class ExplainingsModule {}
