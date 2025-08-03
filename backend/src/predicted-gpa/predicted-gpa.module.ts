import { Module } from '@nestjs/common';
import { PredictedGpaController } from './predicted-gpa.controller';
import { PredictedGpaService } from './predicted-gpa.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [PredictedGpaController],
  providers: [PredictedGpaService, PrismaService],
})
export class PredictedGpaModule {}
