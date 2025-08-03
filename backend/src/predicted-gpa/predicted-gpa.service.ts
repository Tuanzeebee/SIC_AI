import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';

@Injectable()
export class PredictedGpaService {
  private readonly logger = new Logger(PredictedGpaService.name);

  constructor(private prisma: PrismaService) {}

  async calculatePredictedGpa(userId: number): Promise<{
    predictedGpa: number;
    predictedAcademicRank: string;
    totalPredictedCourses: number;
    totalPredictedCredits: number;
    averagePredictedScore: number;
  }> {
    this.logger.log(`Calculating predicted GPA for user ${userId}`);

    // Get all predicted scores for the user with course details
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
      }
    });

    if (predictedScores.length === 0) {
      return {
        predictedGpa: 0,
        predictedAcademicRank: 'Chưa có dữ liệu',
        totalPredictedCourses: 0,
        totalPredictedCredits: 0,
        averagePredictedScore: 0
      };
    }

    // Calculate weighted GPA (4.0 scale)
    let totalWeightedPoints = 0;
    let totalCredits = 0;
    let totalScore = 0;

    for (const record of predictedScores) {
      const credits = record.inputScore.creditsUnit;
      const score = record.predictedScore;
      
      // Convert 10.0 scale to 4.0 scale GPA points
      const gpaPoints = this.convertTo4PointScale(score);
      
      totalWeightedPoints += gpaPoints * credits;
      totalCredits += credits;
      totalScore += score;
    }

    const predictedGpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;
    const averagePredictedScore = predictedScores.length > 0 ? totalScore / predictedScores.length : 0;
    
    // Determine academic rank based on 4.0 scale
    const predictedAcademicRank = this.getAcademicRank(predictedGpa);

    return {
      predictedGpa: parseFloat(predictedGpa.toFixed(2)),
      predictedAcademicRank,
      totalPredictedCourses: predictedScores.length,
      totalPredictedCredits: totalCredits,
      averagePredictedScore: parseFloat(averagePredictedScore.toFixed(2))
    };
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

  private getAcademicRank(gpa: number): string {
    if (gpa >= 3.6) return 'Xuất sắc';
    if (gpa >= 3.2) return 'Giỏi';
    if (gpa >= 2.5) return 'Khá';
    if (gpa >= 2.0) return 'Trung bình';
    return 'Yếu';
  }
}
