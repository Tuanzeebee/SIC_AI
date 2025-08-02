import { Module } from '@nestjs/common';
import { SurveyController, SurveyResponseController } from './survey.controller';
import { SurveyAnalysisController } from './urvey-analysis.controller';
import { SurveyService } from './survey.service';
import { SurveyAnalysisService } from './survey-analysis.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [SurveyController, SurveyResponseController, SurveyAnalysisController],
  providers: [SurveyService, SurveyAnalysisService, PrismaService],
  exports: [SurveyService, SurveyAnalysisService],
})
export class SurveyModule {}
