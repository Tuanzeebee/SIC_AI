import { Module } from '@nestjs/common';
import { PredictionScoreController } from './prediction-score.controller';
import { PredictionScoreService } from './prediction-score.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [PredictionScoreController],
  providers: [PredictionScoreService, PrismaService],
  exports: [PredictionScoreService],
})
export class PredictionScoreModule {}
