import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PredictionScoreService } from './prediction-score.service';

@Controller('prediction-score')
export class PredictionScoreController {
  constructor(private readonly predictionScoreService: PredictionScoreService) {}

  @Post('populate')
  @HttpCode(HttpStatus.OK)
  async populateMissingValues() {
    const result = await this.predictionScoreService.populateMissingValues();
    return {
      message: 'Successfully populated missing values',
      ...result
    };
  }

  @Get('debug')
  @HttpCode(HttpStatus.OK)
  async debugData() {
    const result = await this.predictionScoreService.getDebugInfo();
    return result;
  }

  @Post('recalculate-all')
  @HttpCode(HttpStatus.OK)
  async recalculateAllInteractionFeatures() {
    const result = await this.predictionScoreService.recalculateAllInteractionFeatures();
    return {
      message: 'Successfully recalculated all interaction features',
      ...result
    };
  }
}
