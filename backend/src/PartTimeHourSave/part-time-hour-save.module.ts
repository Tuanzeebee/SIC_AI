import { Module } from '@nestjs/common';
import { PartTimeHourSaveController } from './part-time-hour-save.controller';
import { PartTimeHourSaveService } from './part-time-hour-save.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [PartTimeHourSaveController],
  providers: [PartTimeHourSaveService, PrismaService],
  exports: [PartTimeHourSaveService],
})
export class PartTimeHourSaveModule {}
