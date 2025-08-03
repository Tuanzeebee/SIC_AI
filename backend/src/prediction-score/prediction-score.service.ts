import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService/prisma.service';

@Injectable()
export class PredictionScoreService {
  constructor(private prisma: PrismaService) {}

  private readonly subjectTypeMap = {
    'CMU-SE 100': 'major',
    'CS 201': 'general',
    'CS 211': 'major',
    'DTE-IS 102': 'major',
    'IS-ENG 136': 'major',
    'CHE 101': 'general',
    'CMU-CS 252': 'major',
    'CMU-CS 311': 'major',
    'DTE-IS 152': 'major',
    'IS-ENG 137': 'major',
    'IS-ENG 186': 'major',
    'MTH 103': 'general',
    'COM 141': 'general',
    'PHY 101': 'major',
    'CMU-CS 303': 'major',
    'CMU-SE 214': 'major',
    'HIS 222': 'general',
    'IS-ENG 187': 'major',
    'IS-ENG 236': 'major',
    'MTH 104': 'general',
    'PHI 100': 'general',
    'CMU-CS 246': 'major',
    'CMU-CS 297': 'major',
    'CMU-CS 316': 'major',
    'CMU-ENG 130': 'major',
    'COM 142': 'general',
    'EVR 205': 'general',
    'MTH 254': 'major',
    'STA 151': 'general',
    'CMU-IS 432': 'major',
    'CMU-SE 252': 'major',
    'CMU-SE 303': 'major',
    'IS 301': 'major',
    'MTH 291': 'major',
    'PHI 150': 'general',
    'CMU-CS 445': 'major',
    'CMU-CS 447': 'major',
    'CMU-CS 462': 'major',
    'CMU-ENG 230': 'major',
    'CS 464': 'major',
    'MTH 203': 'general',
    'MTH 204': 'general',
    'MTH 341': 'major',
    'CMU-IS 401': 'major',
    'CS 466': 'major',
    'LAW 201': 'general',
    'POS 151': 'general',
    'POS 361': 'general',
    'HIS 221': 'general',
    'CMU-SE 450': 'major',
    'CMU-SE 403': 'major',
    'CMU-SE 451': 'major',
    'CMU-SE 433': 'major',
    'POS 351': 'general',
    'HIS 362': 'general',
    'IS 385': 'general',
  };

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    
    const sortedValues = values.filter(v => v !== null && v !== undefined).sort((a, b) => a - b);
    if (sortedValues.length === 0) return 0;
    
    const middle = Math.floor(sortedValues.length / 2);
    
    if (sortedValues.length % 2 === 0) {
      return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
    } else {
      return sortedValues[middle];
    }
  }

  private getSubjectType(courseCode: string): string {
    return this.subjectTypeMap[courseCode] || 'general'; // Default to 'general' if not found
  }

  async populateMissingValues(): Promise<{ updatedCount: number; totalCoursesProcessed: number }> {
    // 1. Read all data from PredictionInputScore
    const allRecords = await this.prisma.predictionInputScore.findMany();
    
    if (allRecords.length === 0) {
      return { updatedCount: 0, totalCoursesProcessed: 0 };
    }

    // 2. Assign subject_type and group data
    const recordsByType = {
      major: [],
      general: []
    };

    allRecords.forEach(record => {
      const subjectType = this.getSubjectType(record.courseCode);
      recordsByType[subjectType].push(record);
    });

    // 3. Calculate medians by subject_type for base fields only
    const medianByType = {};
    
    for (const type of ['major', 'general']) {
      const records = recordsByType[type];
      
      if (records.length === 0) {
        // Set default values if no records of this type
        medianByType[type] = {
          weeklyStudyHours: 0,
          attendancePercentage: 0,
          partTimeHours: 0,
          financialSupport: 0,
          emotionalSupport: 0,
        };
        continue;
      }

      // Only calculate medians for base fields, interaction features will be calculated
      medianByType[type] = {
        weeklyStudyHours: this.calculateMedian(
          records.map(r => r.weeklyStudyHours).filter(v => v !== null && v !== undefined && v > 0)
        ),
        attendancePercentage: this.calculateMedian(
          records.map(r => r.attendancePercentage).filter(v => v !== null && v !== undefined && v > 0)
        ),
        partTimeHours: this.calculateMedian(
          records.map(r => r.partTimeHours).filter(v => v !== null && v !== undefined && v >= 0)
        ),
        financialSupport: this.calculateMedian(
          records.map(r => r.financialSupport).filter(v => v !== null && v !== undefined && v >= 0)
        ),
        emotionalSupport: this.calculateMedian(
          records.map(r => r.emotionalSupport).filter(v => v !== null && v !== undefined && v >= 0)
        ),
      };
    }

    // 4. Update records with missing values
    let updatedCount = 0;
    const totalCoursesProcessed = allRecords.length;

    for (const record of allRecords) {
      // Check if any of the base fields are null/undefined
      const needsUpdate = 
        record.weeklyStudyHours === null || record.weeklyStudyHours === undefined ||
        record.attendancePercentage === null || record.attendancePercentage === undefined ||
        record.partTimeHours === null || record.partTimeHours === undefined ||
        record.financialSupport === null || record.financialSupport === undefined ||
        record.emotionalSupport === null || record.emotionalSupport === undefined;

      if (needsUpdate) {
        const subjectType = this.getSubjectType(record.courseCode);
        const medianValues = medianByType[subjectType];

        // Use existing values if available, otherwise use median
        const weeklyStudyHours = record.weeklyStudyHours ?? medianValues.weeklyStudyHours;
        const attendancePercentage = record.attendancePercentage ?? medianValues.attendancePercentage;
        const partTimeHours = record.partTimeHours ?? medianValues.partTimeHours;
        const financialSupport = record.financialSupport ?? medianValues.financialSupport;
        const emotionalSupport = record.emotionalSupport ?? medianValues.emotionalSupport;

        // Calculate interaction features based on ML service logic
        const studyHoursXAttendance = weeklyStudyHours * (attendancePercentage / 100);
        const studyHoursXPartTime = weeklyStudyHours * partTimeHours;
        const financialSupportXPartTime = financialSupport * partTimeHours;
        const attendanceXEmotionalSupport = (attendancePercentage / 100) * emotionalSupport;
        const fullInteractionFeature = weeklyStudyHours * (attendancePercentage / 100) * partTimeHours * financialSupport * emotionalSupport;

        await this.prisma.predictionInputScore.update({
          where: { id: record.id },
          data: {
            weeklyStudyHours,
            attendancePercentage,
            partTimeHours,
            financialSupport,
            emotionalSupport,
            studyHoursXAttendance,
            studyHoursXPartTime,
            financialSupportXPartTime,
            attendanceXEmotionalSupport,
            fullInteractionFeature,
          }
        });

        updatedCount++;
      } else {
        // Even if base fields are not null, we should recalculate interaction features 
        // if they are 0 or null but base fields have values
        const hasValidBaseFields = 
          (record.weeklyStudyHours !== null && record.weeklyStudyHours !== undefined && record.weeklyStudyHours > 0) && 
          (record.attendancePercentage !== null && record.attendancePercentage !== undefined && record.attendancePercentage > 0) && 
          (record.partTimeHours !== null && record.partTimeHours !== undefined && record.partTimeHours >= 0) && 
          (record.financialSupport !== null && record.financialSupport !== undefined && record.financialSupport >= 0) && 
          (record.emotionalSupport !== null && record.emotionalSupport !== undefined && record.emotionalSupport >= 0);

        const hasInvalidInteractionFeatures = 
          record.studyHoursXAttendance === null || record.studyHoursXAttendance === undefined || record.studyHoursXAttendance === 0 ||
          record.studyHoursXPartTime === null || record.studyHoursXPartTime === undefined || record.studyHoursXPartTime === 0 ||
          record.attendanceXEmotionalSupport === null || record.attendanceXEmotionalSupport === undefined || record.attendanceXEmotionalSupport === 0 ||
          record.fullInteractionFeature === null || record.fullInteractionFeature === undefined || record.fullInteractionFeature === 0;

        if (hasValidBaseFields && hasInvalidInteractionFeatures) {
          // Recalculate interaction features using non-null values
          const studyHoursXAttendance = record.weeklyStudyHours! * (record.attendancePercentage! / 100);
          const studyHoursXPartTime = record.weeklyStudyHours! * record.partTimeHours!;
          const financialSupportXPartTime = record.financialSupport! * record.partTimeHours!;
          const attendanceXEmotionalSupport = (record.attendancePercentage! / 100) * record.emotionalSupport!;
          const fullInteractionFeature = record.weeklyStudyHours! * (record.attendancePercentage! / 100) * record.partTimeHours! * record.financialSupport! * record.emotionalSupport!;

          await this.prisma.predictionInputScore.update({
            where: { id: record.id },
            data: {
              studyHoursXAttendance,
              studyHoursXPartTime,
              financialSupportXPartTime,
              attendanceXEmotionalSupport,
              fullInteractionFeature,
            }
          });

          updatedCount++;
        }
      }
    }

    return { updatedCount, totalCoursesProcessed };
  }

  async getDebugInfo() {
    const allRecords = await this.prisma.predictionInputScore.findMany({
      take: 10, // Lấy 10 bản ghi đầu tiên để debug
      orderBy: { id: 'asc' }
    });

    const debugInfo = allRecords.map(record => {
      const subjectType = this.getSubjectType(record.courseCode);
      
      // Tính toán lại interaction features để so sánh
      const calculatedStudyHoursXAttendance = record.weeklyStudyHours && record.attendancePercentage 
        ? record.weeklyStudyHours * (record.attendancePercentage / 100) 
        : null;
      
      const calculatedStudyHoursXPartTime = record.weeklyStudyHours && record.partTimeHours 
        ? record.weeklyStudyHours * record.partTimeHours 
        : null;
      
      const calculatedFullInteractionFeature = record.weeklyStudyHours && record.attendancePercentage && record.partTimeHours && record.financialSupport && record.emotionalSupport
        ? record.weeklyStudyHours * (record.attendancePercentage / 100) * record.partTimeHours * record.financialSupport * record.emotionalSupport
        : null;

      return {
        id: record.id,
        courseCode: record.courseCode,
        subjectType,
        weeklyStudyHours: record.weeklyStudyHours,
        attendancePercentage: record.attendancePercentage,
        partTimeHours: record.partTimeHours,
        financialSupport: record.financialSupport,
        emotionalSupport: record.emotionalSupport,
        // Current stored values
        storedStudyHoursXAttendance: record.studyHoursXAttendance,
        storedStudyHoursXPartTime: record.studyHoursXPartTime,
        storedFullInteractionFeature: record.fullInteractionFeature,
        // Calculated values for comparison
        calculatedStudyHoursXAttendance,
        calculatedStudyHoursXPartTime,
        calculatedFullInteractionFeature,
        // Check if values match
        attendanceMatches: Math.abs((record.studyHoursXAttendance || 0) - (calculatedStudyHoursXAttendance || 0)) < 0.001,
        partTimeMatches: Math.abs((record.studyHoursXPartTime || 0) - (calculatedStudyHoursXPartTime || 0)) < 0.001,
        fullInteractionMatches: Math.abs((record.fullInteractionFeature || 0) - (calculatedFullInteractionFeature || 0)) < 0.001,
      };
    });

    return {
      message: 'Debug information for first 10 records',
      records: debugInfo,
      summary: {
        totalRecords: debugInfo.length,
        correctAttendance: debugInfo.filter(r => r.attendanceMatches).length,
        correctPartTime: debugInfo.filter(r => r.partTimeMatches).length,
        correctFullInteraction: debugInfo.filter(r => r.fullInteractionMatches).length,
      }
    };
  }

  async recalculateAllInteractionFeatures(): Promise<{ updatedCount: number; totalCoursesProcessed: number }> {
    const allRecords = await this.prisma.predictionInputScore.findMany();
    
    if (allRecords.length === 0) {
      return { updatedCount: 0, totalCoursesProcessed: 0 };
    }

    let updatedCount = 0;
    const totalCoursesProcessed = allRecords.length;

    for (const record of allRecords) {
      // Chỉ tính toán lại nếu có đủ dữ liệu base fields
      if (
        record.weeklyStudyHours !== null && record.weeklyStudyHours !== undefined &&
        record.attendancePercentage !== null && record.attendancePercentage !== undefined &&
        record.partTimeHours !== null && record.partTimeHours !== undefined &&
        record.financialSupport !== null && record.financialSupport !== undefined &&
        record.emotionalSupport !== null && record.emotionalSupport !== undefined
      ) {
        // Tính toán lại tất cả interaction features theo logic của ML service
        const studyHoursXAttendance = record.weeklyStudyHours * (record.attendancePercentage / 100);
        const studyHoursXPartTime = record.weeklyStudyHours * record.partTimeHours;
        const financialSupportXPartTime = record.financialSupport * record.partTimeHours;
        const attendanceXEmotionalSupport = (record.attendancePercentage / 100) * record.emotionalSupport;
        const fullInteractionFeature = record.weeklyStudyHours * (record.attendancePercentage / 100) * record.partTimeHours * record.financialSupport * record.emotionalSupport;

        await this.prisma.predictionInputScore.update({
          where: { id: record.id },
          data: {
            studyHoursXAttendance,
            studyHoursXPartTime,
            financialSupportXPartTime,
            attendanceXEmotionalSupport,
            fullInteractionFeature,
          }
        });

        updatedCount++;
      }
    }

    return { updatedCount, totalCoursesProcessed };
  }
}
