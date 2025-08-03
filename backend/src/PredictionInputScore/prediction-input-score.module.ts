import { Module } from '@nestjs/common';
import { PredictionInputScoreController } from './prediction-input-score.controller';
import { PredictionInputScoreService } from './prediction-input-score.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [PredictionInputScoreController],
  providers: [PredictionInputScoreService, PrismaService],
  exports: [PredictionInputScoreService],
})
export class PredictionInputScoreModule {}
