import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import axios from 'axios';

interface MLPredictionRequest {
  semester_number: number;
  course_code: string;
  study_format: string;
  credits_unit: number;
  weekly_study_hours: number;
  attendance_percentage: number;
  part_time_hours: number;
  financial_support: number;
  emotional_support: number;
}

interface MLPredictionResponse {
  mode: string;
  predicted_score: number;
}

@Injectable()
export class PredictedScoreService {
  private readonly logger = new Logger(PredictedScoreService.name);
  private readonly ML_API_URL = 'http://localhost:8000'; // ML service URL

  constructor(private prisma: PrismaService) {}

  async populatePredictions(): Promise<{ 
    processedCount: number; 
    createdCount: number; 
    skippedCount: number; 
    errorCount: number;
    errors: string[];
  }> {
    this.logger.log('Starting prediction population process...');

    // 1. Fetch all records from PredictionInputScore that are ready for prediction
    const readyRecords = await this.prisma.predictionInputScore.findMany({
      where: {
        // Check that all required fields are non-null
        weeklyStudyHours: { not: null },
        attendancePercentage: { not: null },
        partTimeHours: { not: null },
        financialSupport: { not: null },
        emotionalSupport: { not: null },
        // Exclude records that already have predictions
        predictedScore: null
      },
      orderBy: { id: 'asc' }
    });

    this.logger.log(`Found ${readyRecords.length} records ready for prediction`);

    let processedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const record of readyRecords) {
      try {
        processedCount++;
        
        // Check if prediction already exists (double-check to avoid race conditions)
        const existingPrediction = await this.prisma.predictedScore.findUnique({
          where: { inputScoreId: record.id }
        });

        if (existingPrediction) {
          this.logger.debug(`Prediction already exists for record ${record.id}, skipping`);
          skippedCount++;
          continue;
        }

        // 2. Prepare data for ML API
        const mlRequest: MLPredictionRequest = {
          semester_number: record.semesterNumber,
          course_code: record.courseCode,
          study_format: record.studyFormat,
          credits_unit: record.creditsUnit,
          weekly_study_hours: record.weeklyStudyHours!,
          attendance_percentage: record.attendancePercentage!,
          part_time_hours: record.partTimeHours!,
          financial_support: record.financialSupport!,
          emotional_support: record.emotionalSupport!,
        };

        // 3. Send POST request to Python ML API
        this.logger.debug(`Sending prediction request for record ${record.id}`);
        const response = await axios.post<MLPredictionResponse>(
          `${this.ML_API_URL}/predict`,
          mlRequest,
          {
            timeout: 30000, // 30 second timeout
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const predictedScore = response.data.predicted_score;
        this.logger.debug(`Received prediction ${predictedScore} for record ${record.id}`);

        // 4. Convert predicted score to letter grade and 4.0 scale
        const convertedScore = this.convertNumericToLetterGrade(predictedScore);
        const convertedNumericScore = this.convertTo4PointScale(predictedScore);

        // 5. Save prediction to PredictedScore table
        await this.prisma.predictedScore.create({
          data: {
            userId: record.userId,
            inputScoreId: record.id,
            predictedScore: predictedScore, // Original score (10.0 scale)
            PredictedconvertedNumericScore: convertedNumericScore, // Converted to 4.0 scale
            PredictedconvertedScore: convertedScore, // Letter grade
          }
        });

        createdCount++;
        this.logger.debug(`Created prediction record for input ${record.id}`);

      } catch (error) {
        errorCount++;
        const errorMessage = `Error processing record ${record.id}: ${error.message}`;
        this.logger.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    const summary = {
      processedCount,
      createdCount,
      skippedCount,
      errorCount,
      errors
    };

    this.logger.log(`Prediction population completed: ${JSON.stringify(summary)}`);
    return summary;
  }

  private convertNumericToLetterGrade(score: number): string {
    // Convert numeric score to letter grade based on official grading standards
    // Giỏi: 9.5-10.0 → A+
    if (score >= 9.5) return 'A+';
    // 8.5-9.4 → A
    if (score >= 8.5) return 'A';
    // Khá: 8.0-8.4 → A-
    if (score >= 8.0) return 'A-';
    // 7.5-7.9 → B+
    if (score >= 7.5) return 'B+';
    // 7.0-7.4 → B
    if (score >= 7.0) return 'B';
    // Trung bình: 6.5-6.9 → B-
    if (score >= 6.5) return 'B-';
    // 6.0-6.4 → C+
    if (score >= 6.0) return 'C+';
    // 5.5-5.9 → C
    if (score >= 5.5) return 'C';
    // Trung bình yếu: 4.5-5.4 → C-
    if (score >= 4.5) return 'C-';
    // Không đạt: 4.0-4.4 → D
    if (score >= 4.0) return 'D';
    // Kém: 0.0-3.9 → F
    return 'F';
  }

  private convertTo4PointScale(score: number): number {
    // Convert 10.0 scale to 4.0 scale according to official grading standards
    // Giỏi: 9.5-10.0 → A+ → 4.0
    if (score >= 9.5) return 4.0;
    // 8.5-9.4 → A → 4.0
    if (score >= 8.5) return 4.0;
    // Khá: 8.0-8.4 → A- → 3.65
    if (score >= 8.0) return 3.65;
    // 7.5-7.9 → B+ → 3.33
    if (score >= 7.5) return 3.33;
    // 7.0-7.4 → B → 3.0
    if (score >= 7.0) return 3.0;
    // Trung bình: 6.5-6.9 → B- → 2.65
    if (score >= 6.5) return 2.65;
    // 6.0-6.4 → C+ → 2.33
    if (score >= 6.0) return 2.33;
    // 5.5-5.9 → C → 2.0
    if (score >= 5.5) return 2.0;
    // Trung bình yếu: 4.5-5.4 → C- → 1.65
    if (score >= 4.5) return 1.65;
    // Không đạt: 4.0-4.4 → D → 1.0
    if (score >= 4.0) return 1.0;
    // Kém: 0.0-3.9 → F → 0.0
    return 0.0;
  }

  async getReadyRecordsCount(): Promise<{
    totalRecords: number;
    readyForPrediction: number;
    alreadyPredicted: number;
    missingData: number;
  }> {
    // Count total records
    const totalRecords = await this.prisma.predictionInputScore.count();

    // Count records ready for prediction (all required fields non-null, no existing prediction)
    const readyForPrediction = await this.prisma.predictionInputScore.count({
      where: {
        weeklyStudyHours: { not: null },
        attendancePercentage: { not: null },
        partTimeHours: { not: null },
        financialSupport: { not: null },
        emotionalSupport: { not: null },
        predictedScore: null
      }
    });

    // Count records that already have predictions
    const alreadyPredicted = await this.prisma.predictionInputScore.count({
      where: {
        predictedScore: { isNot: null }
      }
    });

    // Count records with missing data
    const missingData = await this.prisma.predictionInputScore.count({
      where: {
        OR: [
          { weeklyStudyHours: null },
          { attendancePercentage: null },
          { partTimeHours: null },
          { financialSupport: null },
          { emotionalSupport: null },
        ]
      }
    });

    return {
      totalRecords,
      readyForPrediction,
      alreadyPredicted,
      missingData
    };
  }

  async testMLConnection(): Promise<{ isConnected: boolean; error?: string }> {
    try {
      // Test with a sample prediction request
      const testRequest: MLPredictionRequest = {
        semester_number: 1,
        course_code: "CMU-CS 303",
        study_format: "LEC",
        credits_unit: 3,
        weekly_study_hours: 25.0,
        attendance_percentage: 85.0,
        part_time_hours: 5.0,
        financial_support: 2,
        emotional_support: 2,
      };

      const response = await axios.post<MLPredictionResponse>(
        `${this.ML_API_URL}/predict`,
        testRequest,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      this.logger.log(`ML API test successful. Response: ${JSON.stringify(response.data)}`);
      return { isConnected: true };
    } catch (error) {
      const errorMessage = `ML API connection failed: ${error.message}`;
      this.logger.error(errorMessage);
      return { isConnected: false, error: errorMessage };
    }
  }

  async getPredictedScoresByUserId(userId: number): Promise<any[]> {
    this.logger.log(`Fetching predicted scores for user ${userId}`);

    const predictedScores = await this.prisma.predictedScore.findMany({
      where: { userId },
      include: {
        inputScore: {
          select: {
            semesterNumber: true,
            courseCode: true,
            studyFormat: true,
            creditsUnit: true,
            year: true
          }
        }
      },
      orderBy: [
        { inputScore: { year: 'asc' } },
        { inputScore: { semesterNumber: 'asc' } },
        { inputScore: { courseCode: 'asc' } }
      ]
    });

    return predictedScores.map(score => ({
      id: score.id,
      predictedScore: score.predictedScore,
      PredictedconvertedNumericScore: score.PredictedconvertedNumericScore,
      PredictedconvertedScore: score.PredictedconvertedScore,
      semesterNumber: score.inputScore.semesterNumber,
      courseCode: score.inputScore.courseCode,
      studyFormat: score.inputScore.studyFormat,
      creditsUnit: score.inputScore.creditsUnit,
      year: score.inputScore.year,
      createdAt: score.createdAt
    }));
  }

  async getScoreRecordsWithPredictions(userId: number): Promise<any[]> {
    this.logger.log(`Fetching score records with predictions for user ${userId} (rawScore = null)`);

    // Get all score records for the user where rawScore is null
    const scoreRecords = await this.prisma.scoreRecord.findMany({
      where: { 
        userId,
        rawScore: null // Only get records where rawScore is null
      },
      orderBy: [
        { year: 'asc' },
        { semesterNumber: 'asc' },
        { courseCode: 'asc' }
      ]
    });

    // For each score record, try to find a matching predicted score
    // We'll match by courseCode, studyFormat, semesterNumber, and year
    const results: any[] = [];
    
    for (const record of scoreRecords) {
      // Try to find a matching PredictionInputScore and its prediction
      const matchingPrediction = await this.prisma.predictionInputScore.findFirst({
        where: {
          userId,
          courseCode: record.courseCode,
          studyFormat: record.studyFormat,
          semesterNumber: record.semesterNumber,
          year: record.year
        },
        include: {
          predictedScore: true
        }
      });

      results.push({
        // Course Information from ScoreRecord
        courseCode: record.courseCode,
        courseName: record.courseName || `Course ${record.courseCode}`,
        studyFormat: record.studyFormat, // LOẠI MÔN
        creditsUnit: record.creditsUnit, // TÍN CHỈ
        year: record.year,
        semesterNumber: record.semesterNumber,
        
        // Original scores from ScoreRecord (should be null)
        rawScore: record.rawScore,
        convertedNumericScore: record.convertedNumericScore,
        convertedScore: record.convertedScore,
        
        // Predicted scores from matching PredictionInputScore
        predictedScore: matchingPrediction?.predictedScore?.predictedScore || null,
        predictedConvertedNumericScore: matchingPrediction?.predictedScore?.PredictedconvertedNumericScore || null,
        predictedConvertedScore: matchingPrediction?.predictedScore?.PredictedconvertedScore || null,
        
        // Additional info
        id: record.id,
        createdAt: record.createdAt,
        hasPrediction: !!matchingPrediction?.predictedScore
      });
    }

    return results;
  }

  async createPredictionInputsFromScoreRecords(userId: number): Promise<{
    created: number;
    skipped: number;
    errors: string[];
  }> {
    this.logger.log(`Creating PredictionInputScore records from ScoreRecord (rawScore = null) for user ${userId}`);

    // Get all score records where rawScore is null
    const scoreRecords = await this.prisma.scoreRecord.findMany({
      where: {
        userId,
        rawScore: null
      }
    });

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Get user's survey analysis for financial and emotional support
    const surveyAnalysis = await this.prisma.surveyAnalysisResult.findUnique({
      where: { userId }
    });

    // Default values if no survey data
    const financialSupport = surveyAnalysis?.financialLevel || 2;
    const emotionalSupport = surveyAnalysis?.emotionalLevel || 2;

    // Get user's part-time hours (use median if not available)
    const partTimeHours = 5.0; // Default median value

    for (const scoreRecord of scoreRecords) {
      try {
        // Check if PredictionInputScore already exists
        const existing = await this.prisma.predictionInputScore.findFirst({
          where: {
            userId,
            courseCode: scoreRecord.courseCode,
            studyFormat: scoreRecord.studyFormat,
            semesterNumber: scoreRecord.semesterNumber,
            year: scoreRecord.year
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create PredictionInputScore
        await this.prisma.predictionInputScore.create({
          data: {
            userId,
            semesterNumber: scoreRecord.semesterNumber,
            courseCode: scoreRecord.courseCode,
            studyFormat: scoreRecord.studyFormat,
            creditsUnit: scoreRecord.creditsUnit,
            year: scoreRecord.year,
            mode: 'forward',
            // Default prediction values (will be populated later)
            weeklyStudyHours: 25.0, // Default median
            attendancePercentage: 85.0, // Default median
            partTimeHours,
            financialSupport,
            emotionalSupport,
            // Interaction features (will be calculated later)
            studyHoursXAttendance: 25.0 * 85.0,
            studyHoursXPartTime: 25.0 * partTimeHours,
            financialSupportXPartTime: financialSupport * partTimeHours,
            attendanceXEmotionalSupport: 85.0 * emotionalSupport,
            fullInteractionFeature: 25.0 * 85.0 * partTimeHours * financialSupport
          }
        });

        created++;
      } catch (error) {
        errors.push(`Error creating PredictionInputScore for ${scoreRecord.courseCode}: ${error.message}`);
      }
    }

    return { created, skipped, errors };
  }

  async completeWorkflow(): Promise<{
    populateMedianResult: { updatedCount: number; totalCoursesProcessed: number };
    recalculateResult: { updatedCount: number; totalCoursesProcessed: number };
    predictionResult: { processedCount: number; createdCount: number; skippedCount: number; errorCount: number; errors: string[] };
    success: boolean;
  }> {
    this.logger.log('Starting complete workflow: populate medians -> recalculate -> predict');

    try {
      // Step 1: Call prediction-score populate (fill missing values with medians)
      this.logger.log('Step 1: Populating missing values with medians...');
      const populateResponse = await axios.post(
        'http://localhost:3000/prediction-score/populate',
        {},
        { timeout: 60000 }
      );
      const populateMedianResult = populateResponse.data;
      this.logger.log(`Populate medians completed: ${JSON.stringify(populateMedianResult)}`);

      // Step 2: Call prediction-score recalculate-all (recalculate interaction features)
      this.logger.log('Step 2: Recalculating all interaction features...');
      const recalculateResponse = await axios.post(
        'http://localhost:3000/prediction-score/recalculate-all',
        {},
        { timeout: 60000 }
      );
      const recalculateResult = recalculateResponse.data;
      this.logger.log(`Recalculate completed: ${JSON.stringify(recalculateResult)}`);

      // Step 3: Call predicted-score populate (generate predictions using ML)
      this.logger.log('Step 3: Generating predictions using ML...');
      const predictionResult = await this.populatePredictions();
      this.logger.log(`Predictions completed: ${JSON.stringify(predictionResult)}`);

      return {
        populateMedianResult,
        recalculateResult,
        predictionResult,
        success: true
      };

    } catch (error) {
      const errorMessage = `Complete workflow failed: ${error.message}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
