import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Request,
  Headers,
} from '@nestjs/common';
import { PredictionReverseService } from './prediction-reverse.service';
import { 
  CreatePredictionReverseDto, 
  PredictionReverseResponseDto 
} from './dto/prediction-reverse.dto';

@Controller('api/prediction-reverse')
export class PredictionReverseController {
  constructor(private readonly predictionReverseService: PredictionReverseService) {}

  @Post()
  async createPredictionReverse(
    @Headers('user-id') userId: string,
    @Body() createDto: CreatePredictionReverseDto,
  ): Promise<PredictionReverseResponseDto> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    return this.predictionReverseService.createPredictionReverse(userIdNum, createDto);
  }

  @Get()
  async getAllPredictionReverse(
    @Headers('user-id') userId: string,
  ): Promise<PredictionReverseResponseDto[]> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    return this.predictionReverseService.getAllPredictionReverse(userIdNum);
  }

  @Get(':id')
  async getPredictionReverseById(
    @Headers('user-id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PredictionReverseResponseDto> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    return this.predictionReverseService.getPredictionReverseById(userIdNum, id);
  }

  @Delete(':id')
  async deletePredictionReverse(
    @Headers('user-id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const userIdNum = parseInt(userId) || 1; // Default to user 1 if not provided
    await this.predictionReverseService.deletePredictionReverse(userIdNum, id);
    return { message: 'Reverse prediction deleted successfully' };
  }
}
