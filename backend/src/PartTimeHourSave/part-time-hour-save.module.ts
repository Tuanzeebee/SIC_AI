import { Module } from '@nestjs/common';
import { PartTimeHourSaveController } from './part-time-hour-save.controller';
import { PartTimeHourSaveService } from './part-time-hour-save.service';
import { AutoPredictionTriggerService } from './auto-prediction-trigger.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [PartTimeHourSaveController],
  providers: [PartTimeHourSaveService, AutoPredictionTriggerService, PrismaService],
  exports: [PartTimeHourSaveService, AutoPredictionTriggerService],
})
export class PartTimeHourSaveModule {}
