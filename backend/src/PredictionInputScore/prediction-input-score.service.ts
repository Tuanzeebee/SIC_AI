import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { 
  CreatePredictionInputScoreDto, 
  CreateFromReverseDto,
  PredictionInputScoreResponseDto,
  MLPredictionDto,
  MLPredictionResponseDto 
} from './dto/prediction-input-score.dto';
import axios from 'axios';

@Injectable()
export class PredictionInputScoreService {
  private readonly ML_SERVICE_URL = 'http://localhost:8000';

  constructor(private prisma: PrismaService) {}

  // Helper method to calculate feature engineering
  private calculateFeatureEngineering(
    weeklyStudyHours: number,
    attendancePercentage: number,
    partTimeHours: number,
    financialSupport: number,
    emotionalSupport: number
  ) {
    const attendanceDecimal = attendancePercentage / 100; // Convert percentage to decimal
    
    return {
      studyHoursXAttendance: weeklyStudyHours * attendanceDecimal,
      studyHoursXPartTime: weeklyStudyHours * partTimeHours,
      financialSupportXPartTime: financialSupport * partTimeHours,
      attendanceXEmotionalSupport: attendanceDecimal * emotionalSupport,
      fullInteractionFeature: weeklyStudyHours * attendanceDecimal * partTimeHours * financialSupport * emotionalSupport
    };
  }

  async createPredictionInputScore(
    userId: number,
    createDto: CreatePredictionInputScoreDto,
  ): Promise<PredictionInputScoreResponseDto> {
    try {
      // Calculate interaction features according to requirements
      const weeklyStudyHours = createDto.weeklyStudyHours || 0;
      const attendancePercentage = createDto.attendancePercentage || 0;
      const partTimeHours = createDto.partTimeHours || 0;
      const financialSupport = createDto.financialSupport || 0;
      const emotionalSupport = createDto.emotionalSupport || 0;

      const featureEngineering = this.calculateFeatureEngineering(
        weeklyStudyHours,
        attendancePercentage,
        partTimeHours,
        financialSupport,
        emotionalSupport
      );

      // Create the input record
      const savedInput = await this.prisma.predictionInputScore.create({
        data: {
          userId,
          reverseInputId: createDto.reverseInputId,
          year: createDto.year,
          semesterNumber: createDto.semesterNumber,
          courseCode: createDto.courseCode,
          studyFormat: createDto.studyFormat,
          creditsUnit: createDto.creditsUnit,
          weeklyStudyHours: createDto.weeklyStudyHours,
          attendancePercentage: createDto.attendancePercentage, // Keep original percentage value
          partTimeHours: createDto.partTimeHours,
          financialSupport: createDto.financialSupport,
          emotionalSupport: createDto.emotionalSupport,
          studyHoursXAttendance: featureEngineering.studyHoursXAttendance,
          studyHoursXPartTime: featureEngineering.studyHoursXPartTime,
          financialSupportXPartTime: featureEngineering.financialSupportXPartTime,
          attendanceXEmotionalSupport: featureEngineering.attendanceXEmotionalSupport,
          fullInteractionFeature: featureEngineering.fullInteractionFeature,
          mode: 'forward',
        },
      });

      return savedInput;
    } catch (error) {
      console.error('Error in createPredictionInputScore:', error);
      throw new HttpException(
        'Failed to create prediction input score',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createFromReverse(
    userId: number,
    createFromReverseDto: CreateFromReverseDto,
  ): Promise<PredictionInputScoreResponseDto> {
    try {
      // First, get the reverse prediction data
      const reverseInput = await this.prisma.predictionInputReverse.findUnique({
        where: { 
          id: createFromReverseDto.reverseInputId,
        },
      });

      if (!reverseInput) {
        throw new HttpException(
          'Reverse prediction input not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // Verify that the reverse input belongs to the user
      if (reverseInput.userId !== userId) {
        throw new HttpException(
          'Unauthorized access to reverse prediction',
          HttpStatus.FORBIDDEN,
        );
      }

      // Map the reverse prediction results to forward prediction input
      const createDto: CreatePredictionInputScoreDto = {
        reverseInputId: reverseInput.id,
        year: reverseInput.year,
        semesterNumber: reverseInput.semesterNumber,
        courseCode: reverseInput.courseCode,
        studyFormat: reverseInput.studyFormat,
        creditsUnit: reverseInput.creditsUnit,
        weeklyStudyHours: reverseInput.predictedWeeklyStudyHours || undefined, // Map predicted values
        attendancePercentage: reverseInput.predictedAttendancePercentage || undefined, // Map predicted values
        partTimeHours: reverseInput.partTimeHours || undefined,
        financialSupport: reverseInput.financialSupport || undefined,
        emotionalSupport: reverseInput.emotionalSupport || undefined,
        mode: 'forward',
      };

      return this.createPredictionInputScore(userId, createDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in createFromReverse:', error);
      throw new HttpException(
        'Failed to create prediction from reverse input',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createFromAllReverse(userId: number): Promise<{
    success: boolean;
    created: number;
    overwritten: number;
    skipped: number;
    message: string;
  }> {
    try {
      // Lấy tất cả dữ liệu từ PredictionInputReverse
      const reverseInputs = await this.prisma.predictionInputReverse.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // Lấy tất cả dữ liệu từ PredictionInputScore hiện tại
      const existingRecords = await this.prisma.predictionInputScore.findMany({
        where: { userId },
      });

      // Tạo map theo courseCode, year, semesterNumber
      const existingRecordsMap = new Map(
        existingRecords.map(record => [
          `${record.year}-${record.semesterNumber}-${record.courseCode}`,
          record
        ])
      );

      let createdCount = 0;
      let overwrittenCount = 0;
      let skippedCount = 0;

      // Xử lý từng record trong PredictionInputReverse
      for (const reverseInput of reverseInputs) {
        const courseKey = `${reverseInput.year}-${reverseInput.semesterNumber}-${reverseInput.courseCode}`;
        const existingRecord = existingRecordsMap.get(courseKey);

        if (existingRecord) {
          // Tính lại feature engineering với dữ liệu mới
          const weeklyStudyHours = reverseInput.predictedWeeklyStudyHours || 0;
          const attendancePercentage = reverseInput.predictedAttendancePercentage || 0;
          const partTimeHours = reverseInput.partTimeHours || 0;
          const financialSupport = reverseInput.financialSupport || 0;
          const emotionalSupport = reverseInput.emotionalSupport || 0;

          const featureEngineering = this.calculateFeatureEngineering(
            weeklyStudyHours,
            attendancePercentage,
            partTimeHours,
            financialSupport,
            emotionalSupport
          );

          // Cập nhật record hiện tại với tất cả feature engineering
          await this.prisma.predictionInputScore.update({
            where: { id: existingRecord.id },
            data: {
              weeklyStudyHours: reverseInput.predictedWeeklyStudyHours,
              attendancePercentage: reverseInput.predictedAttendancePercentage,
              partTimeHours: reverseInput.partTimeHours,
              financialSupport: reverseInput.financialSupport,
              emotionalSupport: reverseInput.emotionalSupport,
              studyHoursXAttendance: featureEngineering.studyHoursXAttendance,
              studyHoursXPartTime: featureEngineering.studyHoursXPartTime,
              financialSupportXPartTime: featureEngineering.financialSupportXPartTime,
              attendanceXEmotionalSupport: featureEngineering.attendanceXEmotionalSupport,
              fullInteractionFeature: featureEngineering.fullInteractionFeature,
              reverseInputId: reverseInput.id, // Link to reverse input
            }
          });
          overwrittenCount++;
        } else {
          // Tạo record mới
          const createDto: CreatePredictionInputScoreDto = {
            reverseInputId: reverseInput.id,
            year: reverseInput.year,
            semesterNumber: reverseInput.semesterNumber,
            courseCode: reverseInput.courseCode,
            studyFormat: reverseInput.studyFormat,
            creditsUnit: reverseInput.creditsUnit,
            weeklyStudyHours: reverseInput.predictedWeeklyStudyHours || undefined,
            attendancePercentage: reverseInput.predictedAttendancePercentage || undefined,
            partTimeHours: reverseInput.partTimeHours || undefined,
            financialSupport: reverseInput.financialSupport || undefined,
            emotionalSupport: reverseInput.emotionalSupport || undefined,
            mode: 'forward',
          };

          await this.createPredictionInputScore(userId, createDto);
          createdCount++;
        }
      }

      // Nếu không có dữ liệu reverse input nào
      if (reverseInputs.length === 0) {
        return {
          success: true,
          created: 0,
          overwritten: 0,
          skipped: 0,
          message: 'Không có dữ liệu reverse prediction nào để xử lý'
        };
      }

      return {
        success: true,
        created: createdCount,
        overwritten: overwrittenCount,
        skipped: skippedCount,
        message: `Đã xử lý thành công: ${createdCount} môn học mới, ${overwrittenCount} môn học được cập nhật`
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in createFromAllReverse:', error);
      throw new HttpException(
        'Failed to create predictions from all reverse inputs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllPredictionInputScore(userId: number): Promise<PredictionInputScoreResponseDto[]> {
    try {
      const inputs = await this.prisma.predictionInputScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return inputs;
    } catch (error) {
      console.error('Error in getAllPredictionInputScore:', error);
      throw new HttpException(
        'Failed to get prediction input scores',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPredictionInputScoreById(
    userId: number,
    id: number,
  ): Promise<PredictionInputScoreResponseDto> {
    try {
      const input = await this.prisma.predictionInputScore.findUnique({
        where: { id },
      });

      if (!input) {
        throw new HttpException(
          'Prediction input score not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (input.userId !== userId) {
        throw new HttpException(
          'Unauthorized access to prediction input score',
          HttpStatus.FORBIDDEN,
        );
      }

      return input;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in getPredictionInputScoreById:', error);
      throw new HttpException(
        'Failed to get prediction input score',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deletePredictionInputScore(userId: number, id: number): Promise<void> {
    try {
      const input = await this.prisma.predictionInputScore.findUnique({
        where: { id },
      });

      if (!input) {
        throw new HttpException(
          'Prediction input score not found',
          HttpStatus.NOT_FOUND,
        );
      }

      if (input.userId !== userId) {
        throw new HttpException(
          'Unauthorized access to prediction input score',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.prisma.predictionInputScore.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error in deletePredictionInputScore:', error);
      throw new HttpException(
        'Failed to delete prediction input score',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async callMLPredictionService(
    data: MLPredictionDto,
  ): Promise<MLPredictionResponseDto> {
    try {
      const response = await axios.post(`${this.ML_SERVICE_URL}/predict`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Error calling ML prediction service:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new HttpException(
            'ML prediction service is not available',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        if (error.response) {
          throw new HttpException(
            `ML service error: ${error.response.data?.detail || error.response.statusText}`,
            HttpStatus.BAD_GATEWAY,
          );
        }
      }

      throw new HttpException(
        'Failed to call ML prediction service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
