import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { CreateScoreRecordDto } from './dto/create-score-record.dto';
import { CreatePredictionInputReverseDto, CreatePredictionInputScoreDto } from './dto/create-prediction-input.dto';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class ScoreRecordService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function to process semester number and handle "Hè" conversion
  private parseSemesterNumber(semesterValue: any): number {
    // Handle different column names and convert to string for processing
    const value = String(semesterValue || '1').trim();
    
    // Check if value contains "Hè" (summer semester) and convert to 3
    if (value.toLowerCase().includes('hè') || value.toLowerCase().includes('he')) {
      return 3;
    }
    
    // Try to parse as number
    const parsedSemester = parseInt(value);
    return isNaN(parsedSemester) ? 1 : parsedSemester;
  }

  async uploadCsvFile(userId: number, file: Express.Multer.File) {
    try {
      // Parse CSV content
      const csvData = await this.parseCsvFile(file);
      
      // Retrieve the latest survey analysis result for the user
      const latestSurveyAnalysis = await this.prisma.surveyAnalysisResult.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      // Extract emotional and financial support levels (default to null if no survey analysis found)
      const surveyEmotionalSupport = latestSurveyAnalysis?.emotionalLevel ?? null;
      const surveyFinancialSupport = latestSurveyAnalysis?.financialLevel ?? null;
      
      // Validate and transform data for ScoreRecord
      const scoreRecords = csvData.map((row) => {
        const semesterValue = row.semesterNumber || row['Semester'] || row['semester_number'] || row['Học kỳ'] || '1';
        const validSemester = this.parseSemesterNumber(semesterValue);
        
        const creditsValue = row.creditsUnit || row['Credits'] || row['credits_unit'] || row['Số tín chỉ'] || '3';
        const parsedCredits = parseInt(creditsValue);
        const validCredits = isNaN(parsedCredits) ? 3 : parsedCredits;
        
        const rawScoreValue = row.rawScore || row['Raw Score'] || row['raw_score'] || row['Điểm số'];
        const parsedRawScore = rawScoreValue ? parseFloat(rawScoreValue) : null;
        const validRawScore = (parsedRawScore !== null && !isNaN(parsedRawScore)) ? parsedRawScore : null;
        
        const convertedNumericValue = row.convertedNumericScore || row['converted_numeric_score'];
        const parsedConvertedNumeric = convertedNumericValue ? parseFloat(convertedNumericValue) : null;
        const validConvertedNumeric = (parsedConvertedNumeric !== null && !isNaN(parsedConvertedNumeric)) ? parsedConvertedNumeric : null;
        
        // Extract and validate studentId with multiple possible column names
        const studentIdValue = row.studentId || 
                              row['Student ID'] || 
                              row['student_id'] || 
                              row['Mã sinh viên'] || 
                              row['MSSV'] || 
                              row['StudentID'] || 
                              row['StudentId'] || 
                              row['Student_ID'] || 
                              row['Ma_sinh_vien'] || 
                              row['student_code'] || 
                              row['Student Code'] ||
                              `USER_${userId}_${Math.random().toString(36).substr(2, 9)}`; // Generate if missing
        
        return {
          userId,
          studentId: String(studentIdValue).trim(), // Ensure it's a string and trimmed
          year: row.year || row['Year'] || row['Năm học'] || '',
          semesterNumber: validSemester,
          courseCode: row.courseCode || row['Course Code'] || row['course_code'] || row['Mã môn học'] || '',
          courseName: row.courseName || row['Course Name'] || row['course_name'] || row['Tên môn học'] || null,
          studyFormat: row.studyFormat || row['Study Format'] || row['study_format'] || row['Hình thức học'] || 'Offline',
          creditsUnit: validCredits,
          rawScore: validRawScore,
          convertedNumericScore: validConvertedNumeric,
          convertedScore: row.convertedScore || row['Grade'] || row['converted_score'] || row['Điểm chữ'] || null,
        };
      });

      // Transform data for PredictionInputReverse
      const predictionInputsReverse = csvData.map((row) => {
        const rawScoreValue = row.rawScore || row['Raw Score'] || row['raw_score'] || row['Điểm số'];
        const parsedRawScore = rawScoreValue ? parseFloat(rawScoreValue) : null;
        const validRawScore = (parsedRawScore !== null && !isNaN(parsedRawScore)) ? parsedRawScore : null;
        
        const partTimeValue = row.partTimeHours || row['part_time_hours'];
        const parsedPartTime = partTimeValue ? parseFloat(partTimeValue) : null;
        const validPartTime = (parsedPartTime !== null && !isNaN(parsedPartTime)) ? parsedPartTime : null;
        
        // Use survey analysis values instead of CSV values for financial and emotional support
        const validFinancial = surveyFinancialSupport;
        const validEmotional = surveyEmotionalSupport;
        
        const semesterValue = row.semesterNumber || row['Semester'] || row['semester_number'] || row['Học kỳ'] || '1';
        const validSemester = this.parseSemesterNumber(semesterValue);
        
        const creditsValue = row.creditsUnit || row['Credits'] || row['credits_unit'] || row['Số tín chỉ'] || '3';
        const parsedCredits = parseInt(creditsValue);
        const validCredits = isNaN(parsedCredits) ? 3 : parsedCredits;
        
        const yearValue = row.year || row['Year'] || row['Năm học'] || row['year'] || '2024';
        const validYear = yearValue.toString();
        
        const predictedWeeklyValue = row.predictedWeeklyStudyHours || row['predicted_weekly_study_hours'];
        const parsedPredictedWeekly = predictedWeeklyValue ? parseFloat(predictedWeeklyValue) : null;
        const validPredictedWeekly = (parsedPredictedWeekly !== null && !isNaN(parsedPredictedWeekly)) ? parsedPredictedWeekly : null;
        
        const predictedAttendanceValue = row.predictedAttendancePercentage || row['predicted_attendance_percentage'];
        const parsedPredictedAttendance = predictedAttendanceValue ? parseFloat(predictedAttendanceValue) : null;
        const validPredictedAttendance = (parsedPredictedAttendance !== null && !isNaN(parsedPredictedAttendance)) ? parsedPredictedAttendance : null;
        
        return {
          userId,
          year: validYear,
          semesterNumber: validSemester,
          courseCode: row.courseCode || row['Course Code'] || row['course_code'] || row['Mã môn học'] || '',
          studyFormat: row.studyFormat || row['Study Format'] || row['study_format'] || row['Hình thức học'] || 'Offline',
          creditsUnit: validCredits,
          rawScore: validRawScore,
          partTimeHours: validPartTime,
          financialSupport: validFinancial,
          emotionalSupport: validEmotional,
          // Calculate interaction features - only if values exist
          financialSupportXPartTime: (validPartTime !== null && validFinancial !== null) ? validPartTime * validFinancial : null,
          rawScoreXPartTime: (validRawScore !== null && validPartTime !== null) ? validRawScore * validPartTime : null,
          rawScoreXFinancial: (validRawScore !== null && validFinancial !== null) ? validRawScore * validFinancial : null,
          rawScoreXEmotional: (validRawScore !== null && validEmotional !== null) ? validRawScore * validEmotional : null,
          rawScoreXPartTimeFinancial: (validRawScore !== null && validPartTime !== null && validFinancial !== null) ? validRawScore * validPartTime * validFinancial : null,
          predictedWeeklyStudyHours: validPredictedWeekly,
          predictedAttendancePercentage: validPredictedAttendance,
          mode: 'reverse',
        };
      });

      // Transform data for PredictionInputScore
      const predictionInputsScore = csvData.map((row) => {
        const weeklyStudyValue = row.weeklyStudyHours || row['weekly_study_hours'];
        const parsedWeeklyStudy = weeklyStudyValue ? parseFloat(weeklyStudyValue) : null;
        const validWeeklyStudy = (parsedWeeklyStudy !== null && !isNaN(parsedWeeklyStudy)) ? parsedWeeklyStudy : null;
        
        const attendanceValue = row.attendancePercentage || row['attendance_percentage'];
        const parsedAttendance = attendanceValue ? parseFloat(attendanceValue) : null;
        const validAttendance = (parsedAttendance !== null && !isNaN(parsedAttendance)) ? parsedAttendance : null;
        
        const partTimeValue = row.partTimeHours || row['part_time_hours'];
        const parsedPartTime = partTimeValue ? parseFloat(partTimeValue) : null;
        const validPartTime = (parsedPartTime !== null && !isNaN(parsedPartTime)) ? parsedPartTime : null;
        
        // Use survey analysis values instead of CSV values for financial and emotional support
        const validFinancial = surveyFinancialSupport;
        const validEmotional = surveyEmotionalSupport;
        
        const semesterValue = row.semesterNumber || row['Semester'] || row['semester_number'] || row['Học kỳ'] || '1';
        const validSemester = this.parseSemesterNumber(semesterValue);
        
        const creditsValue = row.creditsUnit || row['Credits'] || row['credits_unit'] || row['Số tín chỉ'] || '3';
        const parsedCredits = parseInt(creditsValue);
        const validCredits = isNaN(parsedCredits) ? 3 : parsedCredits;
        
        const yearValue = row.year || row['Year'] || row['Năm học'] || row['year'] || '2024';
        const validYear = yearValue.toString();
        
        return {
          userId,
          year: validYear,
          semesterNumber: validSemester,
          courseCode: row.courseCode || row['Course Code'] || row['course_code'] || row['Mã môn học'] || '',
          studyFormat: row.studyFormat || row['Study Format'] || row['study_format'] || row['Hình thức học'] || 'Offline',
          creditsUnit: validCredits,
          weeklyStudyHours: validWeeklyStudy,
          attendancePercentage: validAttendance,
          partTimeHours: validPartTime,
          financialSupport: validFinancial,
          emotionalSupport: validEmotional,
          // Calculate interaction features - only if values exist
          studyHoursXAttendance: (validWeeklyStudy !== null && validAttendance !== null) ? validWeeklyStudy * validAttendance / 100 : null,
          studyHoursXPartTime: (validWeeklyStudy !== null && validPartTime !== null) ? validWeeklyStudy * validPartTime : null,
          financialSupportXPartTime: (validFinancial !== null && validPartTime !== null) ? validFinancial * validPartTime : null,
          attendanceXEmotionalSupport: (validAttendance !== null && validEmotional !== null) ? validAttendance * validEmotional / 100 : null,
          fullInteractionFeature: (validWeeklyStudy !== null && validAttendance !== null && validFinancial !== null && validEmotional !== null) ? 
            validWeeklyStudy * validAttendance * validFinancial * validEmotional / 10000 : null,
          mode: 'forward',
        };
      });

      // Use transaction to ensure all operations succeed or fail together
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Delete existing data for this user first (to overwrite)
        // Delete PredictedScore first due to foreign key constraints
        await prisma.predictedScore.deleteMany({
          where: { userId },
        });
        
        await prisma.scoreRecord.deleteMany({
          where: { userId },
        });
        
        await prisma.predictionInputReverse.deleteMany({
          where: { userId },
        });
        
        await prisma.predictionInputScore.deleteMany({
          where: { userId },
        });

        // 2. Bulk create new score records
        const scoreRecordResults = await prisma.scoreRecord.createMany({
          data: scoreRecords,
        });

        // 3. Bulk create new prediction inputs reverse
        const reverseResults = await prisma.predictionInputReverse.createMany({
          data: predictionInputsReverse,
        });

        // 4. Bulk create new prediction inputs score
        const scoreResults = await prisma.predictionInputScore.createMany({
          data: predictionInputsScore,
        });

        return {
          scoreRecords: scoreRecordResults.count,
          reverseInputs: reverseResults.count,
          scoreInputs: scoreResults.count,
          total: csvData.length,
        };
      });

      return {
        created: {
          scoreRecords: result.scoreRecords,
          predictionInputsReverse: result.reverseInputs,
          predictionInputsScore: result.scoreInputs,
        },
        total: result.total,
        sample: scoreRecords.slice(0, 3), // Return first 3 records as sample
        message: `Đã ghi đè thành công ${result.scoreRecords} ScoreRecord, ${result.reverseInputs} PredictionInputReverse, và ${result.scoreInputs} PredictionInputScore từ ${result.total} dòng dữ liệu CSV (dữ liệu cũ đã được xóa). ${latestSurveyAnalysis ? `Sử dụng mức hỗ trợ từ khảo sát: Tinh thần=${surveyEmotionalSupport}, Tài chính=${surveyFinancialSupport}` : 'Chưa có dữ liệu khảo sát, sử dụng giá trị null cho hỗ trợ tinh thần và tài chính'}`,
      };
    } catch (error) {
      throw new Error(`Lỗi khi xử lý file CSV: ${error.message}`);
    }
  }

  private async parseCsvFile(file: Express.Multer.File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(file.buffer.toString('utf8'));
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  async create(createScoreRecordDto: CreateScoreRecordDto) {
    return await this.prisma.scoreRecord.create({
      data: createScoreRecordDto,
    });
  }

  async findByUserId(userId: number) {
    return await this.prisma.scoreRecord.findMany({
      where: { userId },
      orderBy: [
        { year: 'desc' },
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });
  }

  async findAll() {
    return await this.prisma.scoreRecord.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });
  }

  async findById(id: number) {
    return await this.prisma.scoreRecord.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        predictedScore: true,
      },
    });
  }

  async deleteById(id: number) {
    return await this.prisma.scoreRecord.delete({
      where: { id },
    });
  }

  async update(id: number, updateData: Partial<CreateScoreRecordDto>) {
    return await this.prisma.scoreRecord.update({
      where: { id },
      data: updateData,
    });
  }

  // New methods for prediction inputs
  async findPredictionInputsReverseByUserId(userId: number) {
    return await this.prisma.predictionInputReverse.findMany({
      where: { userId },
      orderBy: [
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });
  }

  async findPredictionInputsScoreByUserId(userId: number) {
    return await this.prisma.predictionInputScore.findMany({
      where: { userId },
      orderBy: [
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });
  }

  async getAllPredictionInputsReverse() {
    return await this.prisma.predictionInputReverse.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });
  }

  async getAllPredictionInputsScore() {
    return await this.prisma.predictionInputScore.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });
  }
}
