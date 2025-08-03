import { Module } from '@nestjs/common';
import { PredictedScoreController } from './predicted-score.controller';
import { PredictedScoreService } from './predicted-score.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [PredictedScoreController],
  providers: [PredictedScoreService, PrismaService],
  exports: [PredictedScoreService],
})
export class PredictedScoreModule {}
