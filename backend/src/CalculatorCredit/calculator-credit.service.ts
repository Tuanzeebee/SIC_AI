import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { AcademicStatisticsDto, CourseDetailDto } from './dto/academic-statistics.dto';

@Injectable()
export class CalculatorCreditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate comprehensive academic statistics for a user
   * @param userId - The user ID to calculate statistics for
   * @returns Academic statistics including credits, progress, GPA, and rank
   */
  async calculateAcademicStatistics(userId: number): Promise<AcademicStatisticsDto> {
    // Get all score records for the user
    const scoreRecords = await this.prisma.scoreRecord.findMany({
      where: { userId },
      orderBy: [
        { year: 'desc' },
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });

    // Filter valid records (exclude courses without scores and ES courses)
    const validRecords = scoreRecords.filter(record => 
      record.rawScore !== null && 
      record.rawScore !== undefined && 
      !record.courseCode.toUpperCase().startsWith('ES')
    );

    // Get excluded courses for debugging
    const excludedRecords = scoreRecords.filter(record => 
      record.rawScore === null || 
      record.rawScore === undefined || 
      record.courseCode.toUpperCase().startsWith('ES')
    );

    const excludedCourseCodes = excludedRecords.map(record => 
      `${record.courseCode} (${record.rawScore === null ? 'No Score' : 'ES Course'})`
    );

    // Calculate earned credits
    const earnedCredits = validRecords.reduce((total, record) => 
      total + record.creditsUnit, 0
    );

    // Calculate progress percentage (total program credits = 144)
    const totalProgramCredits = 144;
    const progressPercentage = Math.round((earnedCredits / totalProgramCredits) * 100 * 10) / 10;

    // Calculate GPA
    let gpa = 0;
    let academicRank = 'Chưa có dữ liệu';
    
    if (validRecords.length > 0) {
      const totalWeightedScore = validRecords.reduce((total, record) => 
        total + (record.rawScore! * record.creditsUnit), 0
      );
      const totalCredits = validRecords.reduce((total, record) => 
        total + record.creditsUnit, 0
      );
      
      gpa = Math.round((totalWeightedScore / totalCredits) * 100) / 100;
      
      // Determine academic rank based on Vietnamese university standards
      academicRank = this.getAcademicRank(gpa);
    }

    // Calculate summary information
    const remainingCredits = Math.max(0, totalProgramCredits - earnedCredits);
    const completionRate = `${progressPercentage}%`;

    return {
      totalProgramCredits,
      earnedCredits,
      progressPercentage,
      gpa,
      academicRank,
      totalCourses: scoreRecords.length,
      validCourses: validRecords.length,
      excludedCourses: excludedRecords.length,
      excludedCourseCodes,
      summary: {
        completedCredits: earnedCredits,
        remainingCredits,
        completionRate,
      },
    };
  }

  /**
   * Get detailed course information for a user
   * @param userId - The user ID to get course details for
   * @returns Array of course details with exclusion information
   */
  async getCourseDetails(userId: number): Promise<CourseDetailDto[]> {
    const scoreRecords = await this.prisma.scoreRecord.findMany({
      where: { userId },
      orderBy: [
        { year: 'desc' },
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });

    return scoreRecords.map(record => {
      const isExcluded = record.rawScore === null || 
                        record.rawScore === undefined || 
                        record.courseCode.toUpperCase().startsWith('ES');
      
      let exclusionReason: string | undefined;
      if (isExcluded) {
        if (record.rawScore === null || record.rawScore === undefined) {
          exclusionReason = 'Chưa có điểm';
        } else if (record.courseCode.toUpperCase().startsWith('ES')) {
          exclusionReason = 'Môn học ES (không tính tín chỉ)';
        }
      }

      const semesterLabel = record.semesterNumber === 3 ? 'HK Hè' : `HK${record.semesterNumber}`;

      return {
        courseCode: record.courseCode,
        courseName: record.courseName,
        credits: record.creditsUnit,
        rawScore: record.rawScore,
        convertedScore: record.convertedScore,
        semester: semesterLabel,
        year: record.year,
        isExcluded,
        exclusionReason,
      };
    });
  }

  /**
   * Calculate semester-wise statistics
   * @param userId - The user ID to calculate statistics for
   * @returns Statistics grouped by semester
   */
  async getSemesterStatistics(userId: number) {
    const scoreRecords = await this.prisma.scoreRecord.findMany({
      where: { userId },
      orderBy: [
        { year: 'desc' },
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });

    // Group by semester
    const semesterGroups = scoreRecords.reduce((acc, record) => {
      const semesterKey = `${record.year}-HK${record.semesterNumber === 3 ? 'Hè' : record.semesterNumber}`;
      
      if (!acc[semesterKey]) {
        acc[semesterKey] = [];
      }
      acc[semesterKey].push(record);
      return acc;
    }, {} as Record<string, typeof scoreRecords>);

    // Calculate statistics for each semester
    const semesterStats = Object.entries(semesterGroups).map(([semesterKey, records]) => {
      const validRecords = records.filter(record => 
        record.rawScore !== null && 
        record.rawScore !== undefined && 
        !record.courseCode.toUpperCase().startsWith('ES')
      );

      const semesterCredits = validRecords.reduce((total, record) => 
        total + record.creditsUnit, 0
      );

      let semesterGPA = 0;
      if (validRecords.length > 0) {
        const totalWeightedScore = validRecords.reduce((total, record) => 
          total + (record.rawScore! * record.creditsUnit), 0
        );
        const totalCredits = validRecords.reduce((total, record) => 
          total + record.creditsUnit, 0
        );
        semesterGPA = Math.round((totalWeightedScore / totalCredits) * 100) / 100;
      }

      return {
        semester: semesterKey,
        totalCourses: records.length,
        validCourses: validRecords.length,
        excludedCourses: records.length - validRecords.length,
        earnedCredits: semesterCredits,
        gpa: semesterGPA,
        academicRank: this.getAcademicRank(semesterGPA),
      };
    });

    return semesterStats;
  }

  /**
   * Determine academic rank based on GPA
   * @param gpa - The GPA to evaluate
   * @returns Academic rank in Vietnamese
   */
  private getAcademicRank(gpa: number): string {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    if (gpa > 0) return 'Yếu';
    return 'Chưa có dữ liệu';
  }

  /**
   * Get quick statistics for dashboard
   * @param userId - The user ID to get quick stats for
   * @returns Quick statistics summary
   */
  async getQuickStatistics(userId: number) {
    const scoreRecords = await this.prisma.scoreRecord.findMany({
      where: { userId },
    });

    const validRecords = scoreRecords.filter(record => 
      record.rawScore !== null && 
      record.rawScore !== undefined && 
      !record.courseCode.toUpperCase().startsWith('ES')
    );

    const earnedCredits = validRecords.reduce((total, record) => 
      total + record.creditsUnit, 0
    );

    const progressPercentage = Math.round((earnedCredits / 144) * 100 * 10) / 10;

    let gpa = 0;
    if (validRecords.length > 0) {
      const totalWeightedScore = validRecords.reduce((total, record) => 
        total + (record.rawScore! * record.creditsUnit), 0
      );
      const totalCredits = validRecords.reduce((total, record) => 
        total + record.creditsUnit, 0
      );
      gpa = Math.round((totalWeightedScore / totalCredits) * 100) / 100;
    }

    return {
      earnedCredits,
      progressPercentage,
      gpa,
      academicRank: this.getAcademicRank(gpa),
    };
  }
}
