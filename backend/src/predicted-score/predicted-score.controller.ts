import { Controller, Post, Get, HttpCode, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { PredictedScoreService } from './predicted-score.service';

@Controller('predicted-score')
export class PredictedScoreController {
  constructor(private readonly predictedScoreService: PredictedScoreService) {}

  @Post('populate')
  @HttpCode(HttpStatus.OK)
  async populatePredictions() {
    const result = await this.predictedScoreService.populatePredictions();
    return {
      message: 'Prediction population completed',
      summary: result
    };
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus() {
    const counts = await this.predictedScoreService.getReadyRecordsCount();
    return {
      message: 'Prediction status',
      ...counts
    };
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getPredictedScoresByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const predictedScores = await this.predictedScoreService.getPredictedScoresByUserId(userId);
    return {
      success: true,
      data: predictedScores,
      message: `Retrieved ${predictedScores.length} predicted scores for user ${userId}`
    };
  }

  @Get('score-records-with-predictions/:userId')
  @HttpCode(HttpStatus.OK)
  async getScoreRecordsWithPredictions(@Param('userId', ParseIntPipe) userId: number) {
    const scoreRecords = await this.predictedScoreService.getScoreRecordsWithPredictions(userId);
    return {
      success: true,
      data: scoreRecords,
      message: `Retrieved ${scoreRecords.length} score records with predictions for user ${userId}`,
      summary: {
        total: scoreRecords.length,
        withPredictions: scoreRecords.filter(record => record.hasPrediction).length,
        withoutPredictions: scoreRecords.filter(record => !record.hasPrediction).length
      }
    };
  }

  @Get('test-ml-connection')
  @HttpCode(HttpStatus.OK)
  async testMLConnection() {
    const result = await this.predictedScoreService.testMLConnection();
    return {
      message: 'ML API connection test',
      ...result
    };
  }

  @Post('complete-workflow')
  @HttpCode(HttpStatus.OK)
  async completeWorkflow() {
    const result = await this.predictedScoreService.completeWorkflow();
    return {
      message: 'Complete workflow executed successfully',
      ...result
    };
  }

  @Post('create-prediction-inputs/:userId')
  @HttpCode(HttpStatus.OK)
  async createPredictionInputsFromScoreRecords(@Param('userId', ParseIntPipe) userId: number) {
    const result = await this.predictedScoreService.createPredictionInputsFromScoreRecords(userId);
    return {
      message: 'Created PredictionInputScore records from ScoreRecord',
      ...result
    };
  }
}
