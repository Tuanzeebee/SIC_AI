import { Module } from '@nestjs/common';
import { ScoreRecordController } from './score-record.controller';
import { ScoreRecordService } from './score-record.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [ScoreRecordController],
  providers: [ScoreRecordService, PrismaService],
  exports: [ScoreRecordService],
})
export class ScoreRecordModule {}
