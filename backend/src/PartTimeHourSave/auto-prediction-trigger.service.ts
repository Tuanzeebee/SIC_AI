import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { PartTimeHourSaveService } from './part-time-hour-save.service';
import axios from 'axios';

@Injectable()
export class AutoPredictionTriggerService {
  private readonly ML_SERVICE_URL = 'http://localhost:8000';

  constructor(
    private prisma: PrismaService,
    private partTimeHourSaveService: PartTimeHourSaveService
  ) {}

  /**
   * Check and trigger automatic reverse prediction for records with complete data
   * Call this after any update to PredictionInputReverse
   */
  async checkAndTriggerReversePrediction(userId: number, recordId?: number) {
    try {
      // Find records to check
      const whereClause = recordId 
        ? { id: recordId, userId }
        : { userId };

      const records = await this.prisma.predictionInputReverse.findMany({
        where: whereClause
      });

      const results: any[] = [];

      for (const record of records) {
        // Check if we have enough data for ML prediction
        // Only predict for records that have actual rawScore (not null)
        if (record.rawScore && record.rawScore > 0 && 
            record.financialSupport !== null && 
            record.emotionalSupport !== null &&
            record.partTimeHours !== null &&
            // Check if prediction hasn't been made yet
            (!record.predictedWeeklyStudyHours || !record.predictedAttendancePercentage)) {
          
          try {
            // Call ML service for reverse prediction
            // Only call when we have actual rawScore data
            const mlResult = await this.callMLReverseService({
              semester_number: record.semesterNumber,
              course_code: record.courseCode,
              study_format: record.studyFormat,
              credits_unit: record.creditsUnit,
              raw_score: record.rawScore, // Use actual rawScore (guaranteed to exist)
              part_time_hours: record.partTimeHours,
              financial_support: record.financialSupport,
              emotional_support: record.emotionalSupport,
            });

            // Update record with ML predictions
            const updatedRecord = await this.prisma.predictionInputReverse.update({
              where: { id: record.id },
              data: {
                predictedWeeklyStudyHours: mlResult.predicted_weekly_study_hours,
                predictedAttendancePercentage: mlResult.predicted_attendance_percentage,
              }
            });

            results.push({
              recordId: record.id,
              courseCode: record.courseCode,
              success: true,
              predictions: mlResult
            });

          } catch (mlError) {
            console.error('ML Service Error for record', record.id, ':', mlError.message);
            results.push({
              recordId: record.id,
              courseCode: record.courseCode,
              success: false,
              error: mlError.message
            });
          }
        }
      }

      return {
        success: true,
        message: `Processed ${results.length} predictions`,
        data: results
      };

    } catch (error) {
      console.error('Error in checkAndTriggerReversePrediction:', error);
      throw new Error('Failed to check and trigger reverse predictions: ' + error.message);
    }
  }

  /**
   * Trigger prediction for specific conditions
   */
  async triggerOnRawScoreUpdate(userId: number, recordId: number) {
    return this.checkAndTriggerReversePrediction(userId, recordId);
  }

  /**
   * Trigger prediction for all user records with complete data
   */
  async triggerForAllCompleteRecords(userId: number) {
    return this.checkAndTriggerReversePrediction(userId);
  }

  /**
   * Call ML service for reverse prediction
   */
  private async callMLReverseService(data: {
    semester_number: number;
    course_code: string;
    study_format: string;
    credits_unit: number;
    raw_score: number;
    part_time_hours: number;
    financial_support: number;
    emotional_support: number;
  }): Promise<{
    mode: string;
    predicted_weekly_study_hours: number;
    predicted_attendance_percentage: number;
  }> {
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
      throw new Error(
        `ML Service Error: ${error.response?.data?.detail || error.message}`,
      );
    }
  }
}
