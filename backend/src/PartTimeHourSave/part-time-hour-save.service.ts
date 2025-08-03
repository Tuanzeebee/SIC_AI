import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { CreatePredictionInputReverseDto, CreatePredictionInputScoreDto } from '../ScoreRecord/dto/create-prediction-input.dto';

export interface PartTimeHourSaveInputData {
  userId: number;
  year: string;
  semesterNumber: number;
  courseCode: string;
  partTimeHours: number;
  viewMode: 'semester' | 'full';
}

export interface UpdatePartTimeHoursData {
  userId: number;
  partTimeHours: number;
  viewMode: 'semester' | 'full';
  semesterPartTimeHours?: {[key: string]: number}; // For semester mode
}

@Injectable()
export class PartTimeHourSaveService {
  constructor(private readonly prisma: PrismaService) {}

  async createPredictionInputs(data: PartTimeHourSaveInputData) {
    try {
      const { userId, year, semesterNumber, courseCode, partTimeHours, viewMode } = data;

      // Get the latest survey analysis result for the user
      const latestSurveyAnalysis = await this.prisma.surveyAnalysisResult.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      const surveyEmotionalSupport = latestSurveyAnalysis?.emotionalLevel ?? null;
      const surveyFinancialSupport = latestSurveyAnalysis?.financialLevel ?? null;

      // Base data for both predictions
      const baseData = {
        userId,
        year,
        semesterNumber,
        courseCode,
        studyFormat: 'Online', // Default value
        creditsUnit: 3, // Default value
        partTimeHours,
        financialSupport: surveyFinancialSupport ?? undefined,
        emotionalSupport: surveyEmotionalSupport ?? undefined,
      };

      // Create PredictionInputReverse with calculated interaction features
      const reverseInputData: CreatePredictionInputReverseDto = {
        ...baseData,
        rawScore: 0, // Will be updated when user provides actual score
        // Calculate interaction features
        financialSupportXPartTime: (partTimeHours !== null && surveyFinancialSupport !== null) 
          ? partTimeHours * surveyFinancialSupport : undefined,
        rawScoreXPartTime: undefined, // Will be calculated when rawScore is provided
        rawScoreXFinancial: undefined, // Will be calculated when rawScore is provided  
        rawScoreXEmotional: undefined, // Will be calculated when rawScore is provided
        rawScoreXPartTimeFinancial: undefined, // Will be calculated when rawScore is provided
        predictedWeeklyStudyHours: undefined,
        predictedAttendancePercentage: undefined,
        mode: 'reverse',
      };

      // Create PredictionInputScore with calculated interaction features
      const scoreInputData: CreatePredictionInputScoreDto = {
        ...baseData,
        reverseInputId: undefined, // Will be linked after reverse input is created
        weeklyStudyHours: undefined, // User will provide this
        attendancePercentage: undefined, // User will provide this
        // Calculate interaction features
        studyHoursXAttendance: undefined, // Will be calculated when both values are provided
        studyHoursXPartTime: undefined, // Will be calculated when weeklyStudyHours is provided
        financialSupportXPartTime: (partTimeHours !== null && surveyFinancialSupport !== null) 
          ? partTimeHours * surveyFinancialSupport : undefined,
        attendanceXEmotionalSupport: undefined, // Will be calculated when attendancePercentage is provided
        fullInteractionFeature: undefined, // Will be calculated when all values are provided
        mode: 'forward',
      };

      // Create reverse prediction input
      const reversePrediction = await this.prisma.predictionInputReverse.create({
        data: reverseInputData,
      });

      // Update score input with reverse input ID and create it
      scoreInputData.reverseInputId = reversePrediction.id;
      const scorePrediction = await this.prisma.predictionInputScore.create({
        data: scoreInputData,
      });

      return {
        success: true,
        message: `Đã tạo thành công prediction inputs cho ${viewMode === 'semester' ? 'học kỳ' : 'toàn bộ khóa học'}`,
        data: {
          reversePrediction,
          scorePrediction,
          viewMode,
          userInputs: {
            year,
            semesterNumber,
            courseCode,
            partTimeHours,
          }
        }
      };

    } catch (error) {
      console.error('Error creating prediction inputs:', error);
      throw new Error('Lỗi khi tạo prediction inputs: ' + error.message);
    }
  }

  async updatePredictionWithUserInputs(
    reversePredictionId: number,
    scorePredictionId: number,
    rawScore?: number,
    weeklyStudyHours?: number,
    attendancePercentage?: number
  ) {
    try {
      const updates: any[] = [];

      // Update reverse prediction if rawScore is provided
      if (rawScore !== undefined && reversePredictionId) {
        const reverseInput = await this.prisma.predictionInputReverse.findUnique({
          where: { id: reversePredictionId }
        });

        if (reverseInput) {
          const updatedReverseData = {
            rawScore,
            rawScoreXPartTime: reverseInput.partTimeHours ? rawScore * reverseInput.partTimeHours : null,
            rawScoreXFinancial: reverseInput.financialSupport ? rawScore * reverseInput.financialSupport : null,
            rawScoreXEmotional: reverseInput.emotionalSupport ? rawScore * reverseInput.emotionalSupport : null,
            rawScoreXPartTimeFinancial: (reverseInput.partTimeHours && reverseInput.financialSupport) 
              ? rawScore * reverseInput.partTimeHours * reverseInput.financialSupport : null,
          };

          const updatedReverse = await this.prisma.predictionInputReverse.update({
            where: { id: reversePredictionId },
            data: updatedReverseData,
          });
          updates.push({ type: 'reverse', data: updatedReverse });
        }
      }

      // Update score prediction if study hours or attendance is provided
      if ((weeklyStudyHours !== undefined || attendancePercentage !== undefined) && scorePredictionId) {
        const scoreInput = await this.prisma.predictionInputScore.findUnique({
          where: { id: scorePredictionId }
        });

        if (scoreInput) {
          const newWeeklyStudyHours = weeklyStudyHours ?? scoreInput.weeklyStudyHours;
          const newAttendancePercentage = attendancePercentage ?? scoreInput.attendancePercentage;

          const updatedScoreData: any = {};
          
          if (weeklyStudyHours !== undefined) {
            updatedScoreData.weeklyStudyHours = weeklyStudyHours;
            updatedScoreData.studyHoursXPartTime = scoreInput.partTimeHours 
              ? weeklyStudyHours * scoreInput.partTimeHours : null;
          }
          
          if (attendancePercentage !== undefined) {
            updatedScoreData.attendancePercentage = attendancePercentage;
            updatedScoreData.attendanceXEmotionalSupport = scoreInput.emotionalSupport 
              ? attendancePercentage * scoreInput.emotionalSupport : null;
          }

          // Calculate interaction features if both values are available
          if (newWeeklyStudyHours && newAttendancePercentage) {
            updatedScoreData.studyHoursXAttendance = newWeeklyStudyHours * newAttendancePercentage;
            
            // Calculate full interaction feature if all values are available
            if (scoreInput.partTimeHours && scoreInput.financialSupport && scoreInput.emotionalSupport) {
              updatedScoreData.fullInteractionFeature = 
                newWeeklyStudyHours * newAttendancePercentage * scoreInput.partTimeHours * 
                scoreInput.financialSupport * scoreInput.emotionalSupport;
            }
          }

          const updatedScore = await this.prisma.predictionInputScore.update({
            where: { id: scorePredictionId },
            data: updatedScoreData,
          });
          updates.push({ type: 'score', data: updatedScore });
        }
      }

      return {
        success: true,
        message: 'Đã cập nhật thành công prediction inputs với dữ liệu người dùng nhập',
        updates
      };

    } catch (error) {
      console.error('Error updating prediction inputs:', error);
      throw new Error('Lỗi khi cập nhật prediction inputs: ' + error.message);
    }
  }

  async getUserPredictions(userId: number, viewMode?: 'semester' | 'full') {
    try {
      const reversePredictions = await this.prisma.predictionInputReverse.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          inputScores: true
        }
      });

      const scorePredictions = await this.prisma.predictionInputScore.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          reverseInput: true,
          predictedScore: true
        }
      });

      return {
        success: true,
        data: {
          reversePredictions,
          scorePredictions,
          viewMode
        }
      };

    } catch (error) {
      console.error('Error fetching user predictions:', error);
      throw new Error('Lỗi khi lấy danh sách predictions: ' + error.message);
    }
  }

  async getUserSemesters(userId: number) {
    try {
      // Get unique semesters from PredictionInputReverse table
      const reversePredictions = await this.prisma.predictionInputReverse.findMany({
        where: { userId },
        select: {
          year: true,
          semesterNumber: true
        },
        distinct: ['year', 'semesterNumber'],
        orderBy: [
          { year: 'asc' },
          { semesterNumber: 'asc' }
        ]
      });

      // Also get unique semesters from ScoreRecord table for comparison
      const scoreRecords = await this.prisma.scoreRecord.findMany({
        where: { userId },
        select: {
          year: true,
          semesterNumber: true
        },
        distinct: ['year', 'semesterNumber'],
        orderBy: [
          { year: 'asc' },
          { semesterNumber: 'asc' }
        ]
      });

      // Combine and deduplicate semesters
      const allSemesters = new Map<string, { year: string; semesterNumber: number; label: string }>();

      // Add from reverse predictions
      reversePredictions.forEach(item => {
        const key = `${item.year}-${item.semesterNumber}`;
        if (!allSemesters.has(key)) {
          allSemesters.set(key, {
            year: item.year,
            semesterNumber: item.semesterNumber,
            label: `HK${item.semesterNumber}-${item.year}`
          });
        }
      });

      // Add from score records
      scoreRecords.forEach(item => {
        const key = `${item.year}-${item.semesterNumber}`;
        if (!allSemesters.has(key)) {
          allSemesters.set(key, {
            year: item.year,
            semesterNumber: item.semesterNumber,
            label: `HK${item.semesterNumber}-${item.year}`
          });
        }
      });

      // Convert to array and sort
      const semesters = Array.from(allSemesters.values()).sort((a, b) => {
        if (a.year !== b.year) {
          return a.year.localeCompare(b.year);
        }
        return a.semesterNumber - b.semesterNumber;
      });

      return {
        success: true,
        data: semesters,
        message: `Tìm thấy ${semesters.length} học kỳ`
      };

    } catch (error) {
      console.error('Error fetching user semesters:', error);
      throw new Error('Lỗi khi lấy danh sách học kỳ: ' + error.message);
    }
  }

  async updatePartTimeHours(data: UpdatePartTimeHoursData) {
    try {
      const { userId, partTimeHours, viewMode, semesterPartTimeHours } = data;

      if (viewMode === 'semester' && semesterPartTimeHours) {
        // Update part-time hours for specific semesters
        const updates: Array<{
          semester: string;
          hours: number;
          reverseUpdated: number;
          scoreUpdated: number;
        }> = [];
        
        for (const [semesterKey, hours] of Object.entries(semesterPartTimeHours)) {
          const [year, semesterPart] = semesterKey.split('-HK');
          const semesterNumber = semesterPart === 'Hè' ? 3 : parseInt(semesterPart);
          
          // Update PredictionInputReverse
          const reverseUpdate = await this.prisma.predictionInputReverse.updateMany({
            where: {
              userId,
              year,
              semesterNumber
            },
            data: {
              partTimeHours: hours
            }
          });

          // Update PredictionInputScore
          const scoreUpdate = await this.prisma.predictionInputScore.updateMany({
            where: {
              userId,
              year,
              semesterNumber
            },
            data: {
              partTimeHours: hours
            }
          });

          updates.push({
            semester: semesterKey,
            hours,
            reverseUpdated: reverseUpdate.count,
            scoreUpdated: scoreUpdate.count
          });
        }

        return {
          success: true,
          message: `Đã cập nhật part-time hours cho ${updates.length} học kỳ`,
          data: { viewMode, updates }
        };

      } else {
        // Update part-time hours for all records
        const reverseUpdate = await this.prisma.predictionInputReverse.updateMany({
          where: { userId },
          data: { partTimeHours }
        });

        const scoreUpdate = await this.prisma.predictionInputScore.updateMany({
          where: { userId },
          data: { partTimeHours }
        });

        return {
          success: true,
          message: `Đã cập nhật part-time hours (${partTimeHours}h) cho toàn bộ dữ liệu`,
          data: {
            viewMode,
            partTimeHours,
            reverseRecordsUpdated: reverseUpdate.count,
            scoreRecordsUpdated: scoreUpdate.count
          }
        };
      }

    } catch (error) {
      console.error('Error updating part-time hours:', error);
      throw new Error('Lỗi khi cập nhật part-time hours: ' + error.message);
    }
  }
}
