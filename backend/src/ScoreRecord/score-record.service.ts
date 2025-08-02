import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { CreateScoreRecordDto } from './dto/create-score-record.dto';
import { CreatePredictionInputReverseDto, CreatePredictionInputScoreDto } from './dto/create-prediction-input.dto';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class ScoreRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadCsvFile(userId: number, file: Express.Multer.File) {
    try {
      // Parse CSV content
      const csvData = await this.parseCsvFile(file);
      
      // Validate and transform data for ScoreRecord
      const scoreRecords = csvData.map((row) => {
        const semesterValue = row.semesterNumber || row['Semester'] || row['semester_number'] || row['Học kỳ'] || '1';
        const parsedSemester = parseInt(semesterValue);
        const validSemester = isNaN(parsedSemester) ? 1 : parsedSemester;
        
        const creditsValue = row.creditsUnit || row['Credits'] || row['credits_unit'] || row['Số tín chỉ'] || '3';
        const parsedCredits = parseInt(creditsValue);
        const validCredits = isNaN(parsedCredits) ? 3 : parsedCredits;
        
        const rawScoreValue = row.rawScore || row['Raw Score'] || row['raw_score'] || row['Điểm số'] || '0';
        const parsedRawScore = parseFloat(rawScoreValue);
        const validRawScore = isNaN(parsedRawScore) ? 0 : parsedRawScore;
        
        const convertedNumericValue = row.convertedNumericScore || row['converted_numeric_score'] || '0';
        const parsedConvertedNumeric = parseFloat(convertedNumericValue);
        const validConvertedNumeric = isNaN(parsedConvertedNumeric) ? null : parsedConvertedNumeric;
        
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
        const rawScoreValue = row.rawScore || row['Raw Score'] || row['raw_score'] || row['Điểm số'] || '0';
        const parsedRawScore = parseFloat(rawScoreValue);
        const validRawScore = isNaN(parsedRawScore) ? 0 : parsedRawScore;
        
        const partTimeValue = row.partTimeHours || row['part_time_hours'];
        const parsedPartTime = partTimeValue ? parseFloat(partTimeValue) : null;
        const validPartTime = (parsedPartTime !== null && !isNaN(parsedPartTime)) ? parsedPartTime : null;
        
        const financialValue = row.financialSupport || row['financial_support'];
        const parsedFinancial = financialValue ? parseInt(financialValue) : null;
        const validFinancial = (parsedFinancial !== null && !isNaN(parsedFinancial)) ? parsedFinancial : null;
        
        const emotionalValue = row.emotionalSupport || row['emotional_support'];
        const parsedEmotional = emotionalValue ? parseInt(emotionalValue) : null;
        const validEmotional = (parsedEmotional !== null && !isNaN(parsedEmotional)) ? parsedEmotional : null;
        
        const semesterValue = row.semesterNumber || row['Semester'] || row['semester_number'] || row['Học kỳ'] || '1';
        const parsedSemester = parseInt(semesterValue);
        const validSemester = isNaN(parsedSemester) ? 1 : parsedSemester;
        
        const creditsValue = row.creditsUnit || row['Credits'] || row['credits_unit'] || row['Số tín chỉ'] || '3';
        const parsedCredits = parseInt(creditsValue);
        const validCredits = isNaN(parsedCredits) ? 3 : parsedCredits;
        
        const predictedWeeklyValue = row.predictedWeeklyStudyHours || row['predicted_weekly_study_hours'];
        const parsedPredictedWeekly = predictedWeeklyValue ? parseFloat(predictedWeeklyValue) : null;
        const validPredictedWeekly = (parsedPredictedWeekly !== null && !isNaN(parsedPredictedWeekly)) ? parsedPredictedWeekly : null;
        
        const predictedAttendanceValue = row.predictedAttendancePercentage || row['predicted_attendance_percentage'];
        const parsedPredictedAttendance = predictedAttendanceValue ? parseFloat(predictedAttendanceValue) : null;
        const validPredictedAttendance = (parsedPredictedAttendance !== null && !isNaN(parsedPredictedAttendance)) ? parsedPredictedAttendance : null;
        
        return {
          userId,
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
          rawScoreXPartTime: validPartTime !== null ? validRawScore * validPartTime : null,
          rawScoreXFinancial: validFinancial !== null ? validRawScore * validFinancial : null,
          rawScoreXEmotional: validEmotional !== null ? validRawScore * validEmotional : null,
          rawScoreXPartTimeFinancial: (validPartTime !== null && validFinancial !== null) ? validRawScore * validPartTime * validFinancial : null,
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
        
        const financialValue = row.financialSupport || row['financial_support'];
        const parsedFinancial = financialValue ? parseInt(financialValue) : null;
        const validFinancial = (parsedFinancial !== null && !isNaN(parsedFinancial)) ? parsedFinancial : null;
        
        const emotionalValue = row.emotionalSupport || row['emotional_support'];
        const parsedEmotional = emotionalValue ? parseInt(emotionalValue) : null;
        const validEmotional = (parsedEmotional !== null && !isNaN(parsedEmotional)) ? parsedEmotional : null;
        
        const semesterValue = row.semesterNumber || row['Semester'] || row['semester_number'] || row['Học kỳ'] || '1';
        const parsedSemester = parseInt(semesterValue);
        const validSemester = isNaN(parsedSemester) ? 1 : parsedSemester;
        
        const creditsValue = row.creditsUnit || row['Credits'] || row['credits_unit'] || row['Số tín chỉ'] || '3';
        const parsedCredits = parseInt(creditsValue);
        const validCredits = isNaN(parsedCredits) ? 3 : parsedCredits;
        
        return {
          userId,
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
        message: `Đã ghi đè thành công ${result.scoreRecords} ScoreRecord, ${result.reverseInputs} PredictionInputReverse, và ${result.scoreInputs} PredictionInputScore từ ${result.total} dòng dữ liệu CSV (dữ liệu cũ đã được xóa)`,
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
