import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';
import { 
  GetGpaDto, 
  GpaResultDto, 
  DetailedGpaResultDto, 
  GpaCalculationDetailDto 
} from './dto/calculator-gpa.dto';

@Injectable()
export class CalculatorGpaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate GPA for a user
   * Formula: Sum(convertedNumericScore * creditsUnit) / Sum(creditsUnit)
   */
  async calculateGpa(dto: GetGpaDto): Promise<GpaResultDto> {
    const { userId, year, semesterNumber } = dto;

    // Build where condition
    const whereCondition: any = {
      userId,
      convertedNumericScore: {
        not: null, // Only include records with numeric scores
      },
      courseCode: {
        not: {
          startsWith: 'ES', // Exclude courses starting with 'ES'
        },
      },
    };

    if (year) {
      whereCondition.year = year;
    }

    if (semesterNumber) {
      whereCondition.semesterNumber = semesterNumber;
    }

    // Fetch score records
    const scoreRecords = await this.prisma.scoreRecord.findMany({
      where: whereCondition,
      select: {
        convertedNumericScore: true,
        creditsUnit: true,
        courseCode: true,
        courseName: true,
        year: true,
        semesterNumber: true,
      },
    });

    if (scoreRecords.length === 0) {
      return {
        gpa: 0,
        totalCredits: 0,
        totalWeightedScore: 0,
        recordsCount: 0,
        year,
        semesterNumber,
      };
    }

    // Calculate GPA
    let totalWeightedScore = 0;
    let totalCredits = 0;

    scoreRecords.forEach(record => {
      if (record.convertedNumericScore !== null) {
        const weightedScore = record.convertedNumericScore * record.creditsUnit;
        totalWeightedScore += weightedScore;
        totalCredits += record.creditsUnit;
      }
    });

    const gpa = totalCredits > 0 ? totalWeightedScore / totalCredits : 0;

    return {
      gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
      totalCredits,
      totalWeightedScore: Math.round(totalWeightedScore * 100) / 100,
      recordsCount: scoreRecords.length,
      year,
      semesterNumber,
    };
  }

  /**
   * Calculate GPA with detailed breakdown
   */
  async calculateGpaWithDetails(dto: GetGpaDto): Promise<DetailedGpaResultDto> {
    const { userId, year, semesterNumber } = dto;

    // Build where condition
    const whereCondition: any = {
      userId,
      convertedNumericScore: {
        not: null,
      },
      courseCode: {
        not: {
          startsWith: 'ES', // Exclude courses starting with 'ES'
        },
      },
    };

    if (year) {
      whereCondition.year = year;
    }

    if (semesterNumber) {
      whereCondition.semesterNumber = semesterNumber;
    }

    // Fetch score records
    const scoreRecords = await this.prisma.scoreRecord.findMany({
      where: whereCondition,
      select: {
        convertedNumericScore: true,
        creditsUnit: true,
        courseCode: true,
        courseName: true,
        year: true,
        semesterNumber: true,
      },
      orderBy: [
        { year: 'desc' },
        { semesterNumber: 'desc' },
        { courseCode: 'asc' },
      ],
    });

    if (scoreRecords.length === 0) {
      return {
        gpa: 0,
        totalCredits: 0,
        totalWeightedScore: 0,
        recordsCount: 0,
        details: [],
        year,
        semesterNumber,
      };
    }

    // Calculate GPA and build details
    let totalWeightedScore = 0;
    let totalCredits = 0;
    const details: GpaCalculationDetailDto[] = [];

    scoreRecords.forEach(record => {
      if (record.convertedNumericScore !== null) {
        const weightedScore = record.convertedNumericScore * record.creditsUnit;
        totalWeightedScore += weightedScore;
        totalCredits += record.creditsUnit;

        details.push({
          courseCode: record.courseCode,
          courseName: record.courseName || undefined,
          convertedNumericScore: record.convertedNumericScore,
          creditsUnit: record.creditsUnit,
          weightedScore: Math.round(weightedScore * 100) / 100,
          year: record.year,
          semesterNumber: record.semesterNumber,
        });
      }
    });

    const gpa = totalCredits > 0 ? totalWeightedScore / totalCredits : 0;

    return {
      gpa: Math.round(gpa * 100) / 100,
      totalCredits,
      totalWeightedScore: Math.round(totalWeightedScore * 100) / 100,
      recordsCount: scoreRecords.length,
      details,
      year,
      semesterNumber,
    };
  }

  /**
   * Get cumulative GPA (all semesters)
   */
  async getCumulativeGpa(userId: number): Promise<GpaResultDto> {
    return this.calculateGpa({ userId });
  }

  /**
   * Get GPA by semester
   */
  async getGpaBySemester(userId: number, year: string, semesterNumber: number): Promise<GpaResultDto> {
    return this.calculateGpa({ userId, year, semesterNumber });
  }

  /**
   * Get all semesters GPA for a user
   */
  async getAllSemestersGpa(userId: number): Promise<GpaResultDto[]> {
    // Get unique semesters for the user
    const semesters = await this.prisma.scoreRecord.groupBy({
      by: ['year', 'semesterNumber'],
      where: {
        userId,
        convertedNumericScore: {
          not: null,
        },
        courseCode: {
          not: {
            startsWith: 'ES', // Exclude courses starting with 'ES'
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { semesterNumber: 'desc' },
      ],
    });

    // Calculate GPA for each semester
    const results = await Promise.all(
      semesters.map(semester =>
        this.calculateGpa({
          userId,
          year: semester.year,
          semesterNumber: semester.semesterNumber,
        })
      )
    );

    return results;
  }
}
