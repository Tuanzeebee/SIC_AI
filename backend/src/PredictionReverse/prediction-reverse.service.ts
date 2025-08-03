import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { 
  CreatePredictionReverseDto, 
  PredictionReverseResponseDto,
  MLReversePredictionDto,
  MLReversePredictionResponseDto 
} from './dto/prediction-reverse.dto';
import axios from 'axios';

@Injectable()
export class PredictionReverseService {
  private readonly ML_SERVICE_URL = 'http://localhost:8000';

  constructor(private prisma: PrismaService) {}

  async createPredictionReverse(
    userId: number,
    createDto: CreatePredictionReverseDto,
  ): Promise<PredictionReverseResponseDto> {
    try {
      // Calculate interaction features
      const financialSupportXPartTime = (createDto.financialSupport || 0) * (createDto.partTimeHours || 0);
      const rawScoreXPartTime = (createDto.rawScore || 0) * (createDto.partTimeHours || 0);
      const rawScoreXFinancial = (createDto.rawScore || 0) * (createDto.financialSupport || 0);
      const rawScoreXEmotional = (createDto.rawScore || 0) * (createDto.emotionalSupport || 0);
      const rawScoreXPartTimeFinancial = (createDto.rawScore || 0) * financialSupportXPartTime;

      // First, save the input data to database
      const savedInput = await this.prisma.predictionInputReverse.create({
        data: {
          userId,
          year: createDto.year,
          semesterNumber: createDto.semesterNumber,
          courseCode: createDto.courseCode,
          studyFormat: createDto.studyFormat,
          creditsUnit: createDto.creditsUnit,
          rawScore: createDto.rawScore,
          partTimeHours: createDto.partTimeHours,
          financialSupport: createDto.financialSupport,
          emotionalSupport: createDto.emotionalSupport,
          financialSupportXPartTime,
          rawScoreXPartTime,
          rawScoreXFinancial,
          rawScoreXEmotional,
          rawScoreXPartTimeFinancial,
          mode: 'reverse',
        },
      });

      // Prepare data for ML service
      const mlInputData: MLReversePredictionDto = {
        semester_number: createDto.semesterNumber,
        course_code: createDto.courseCode,
        study_format: createDto.studyFormat,
        credits_unit: createDto.creditsUnit,
        raw_score: createDto.rawScore || 0,
        part_time_hours: createDto.partTimeHours || 0,
        financial_support: createDto.financialSupport || 0,
        emotional_support: createDto.emotionalSupport || 0,
      };

      // Call ML service
      const mlResponse = await this.callMLReverseService(mlInputData);

      // Update the saved input with predictions
      const updatedInput = await this.prisma.predictionInputReverse.update({
        where: { id: savedInput.id },
        data: {
          predictedWeeklyStudyHours: mlResponse.predicted_weekly_study_hours,
          predictedAttendancePercentage: mlResponse.predicted_attendance_percentage,
        },
      });

      return updatedInput;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in createPredictionReverse:', error);
      throw new HttpException(
        'Failed to create reverse prediction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async callMLReverseService(
    data: MLReversePredictionDto,
  ): Promise<MLReversePredictionResponseDto> {
    try {
      const response = await axios.post(`${this.ML_SERVICE_URL}/reverse`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('ML Service Error:', error.response?.data || error.message);
      throw new HttpException(
        `ML Service Error: ${error.response?.data?.detail || error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getAllPredictionReverse(userId: number): Promise<PredictionReverseResponseDto[]> {
    try {
      const predictions = await this.prisma.predictionInputReverse.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return predictions;
    } catch (error) {
      console.error('Error in getAllPredictionReverse:', error);
      throw new HttpException(
        'Failed to fetch reverse predictions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPredictionReverseById(
    userId: number,
    id: number,
  ): Promise<PredictionReverseResponseDto> {
    try {
      const prediction = await this.prisma.predictionInputReverse.findFirst({
        where: { 
          id,
          userId 
        },
      });

      if (!prediction) {
        throw new HttpException(
          'Reverse prediction not found',
          HttpStatus.NOT_FOUND,
        );
      }

      return prediction;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in getPredictionReverseById:', error);
      throw new HttpException(
        'Failed to fetch reverse prediction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePredictionReverse(userId: number, id: number): Promise<void> {
    try {
      const prediction = await this.prisma.predictionInputReverse.findFirst({
        where: { 
          id,
          userId 
        },
      });

      if (!prediction) {
        throw new HttpException(
          'Reverse prediction not found',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.predictionInputReverse.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in deletePredictionReverse:', error);
      throw new HttpException(
        'Failed to delete reverse prediction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
