import { Module } from '@nestjs/common';
import { PredictionReverseController } from './prediction-reverse.controller';
import { PredictionReverseService } from './prediction-reverse.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [PredictionReverseController],
  providers: [PredictionReverseService, PrismaService],
  exports: [PredictionReverseService],
})
export class PredictionReverseModule {}
