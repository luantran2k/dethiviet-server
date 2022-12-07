import { Module } from '@nestjs/common';
import { ExplainingsService } from './explainings.service';
import { ExplainingsController } from './explainings.controller';

@Module({
  controllers: [ExplainingsController],
  providers: [ExplainingsService]
})
export class ExplainingsModule {}
