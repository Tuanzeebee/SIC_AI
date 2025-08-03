import { Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { PredictedGpaService } from './predicted-gpa.service';

@Controller('predicted-gpa')
export class PredictedGpaController {
  constructor(private readonly predictedGpaService: PredictedGpaService) {}

  @Get('calculate/:userId')
  @HttpCode(HttpStatus.OK)
  async calculatePredictedGpa(@Param('userId', ParseIntPipe) userId: number) {
    const result = await this.predictedGpaService.calculatePredictedGpa(userId);
    return {
      success: true,
      data: result,
      message: `Calculated predicted GPA for user ${userId}`
    };
  }
}
