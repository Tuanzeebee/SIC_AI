import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Headers,
} from '@nestjs/common';
import { PredictionInputScoreService } from './prediction-input-score.service';
import { 
  CreatePredictionInputScoreDto, 
  CreateFromReverseDto,
  PredictionInputScoreResponseDto 
} from './dto/prediction-input-score.dto';

@Controller('api/prediction-input-score')
export class PredictionInputScoreController {
  constructor(private readonly predictionInputScoreService: PredictionInputScoreService) {}

  @Post()
  async createPredictionInputScore(
    @Headers('user-id') userId: string,
    @Body() createDto: CreatePredictionInputScoreDto,
  ): Promise<PredictionInputScoreResponseDto> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    return this.predictionInputScoreService.createPredictionInputScore(userIdNum, createDto);
  }

  @Post('from-reverse')
  async createFromReverse(
    @Headers('user-id') userId: string,
    @Body() createFromReverseDto: CreateFromReverseDto,
  ): Promise<PredictionInputScoreResponseDto> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    return this.predictionInputScoreService.createFromReverse(userIdNum, createFromReverseDto);
  }

  @Post('from-all-reverse')
  async createFromAllReverse(
    @Headers('user-id') userId: string,
  ): Promise<{
    success: boolean;
    created: number;
    overwritten: number;
    skipped: number;
    message: string;
  }> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    return this.predictionInputScoreService.createFromAllReverse(userIdNum);
  }

  @Get()
  async getAllPredictionInputScore(
    @Headers('user-id') userId: string,
  ): Promise<PredictionInputScoreResponseDto[]> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    return this.predictionInputScoreService.getAllPredictionInputScore(userIdNum);
  }

  @Get(':id')
  async getPredictionInputScoreById(
    @Headers('user-id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PredictionInputScoreResponseDto> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    return this.predictionInputScoreService.getPredictionInputScoreById(userIdNum, id);
  }

  @Delete(':id')
  async deletePredictionInputScore(
    @Headers('user-id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    await this.predictionInputScoreService.deletePredictionInputScore(userIdNum, id);
    return { message: 'Prediction input score deleted successfully' };
  }
}
