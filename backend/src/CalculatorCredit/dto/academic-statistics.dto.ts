export interface AcademicStatisticsDto {
  totalProgramCredits: number;
  earnedCredits: number;
  progressPercentage: number;
  gpa: number;
  academicRank: string;
  totalCourses: number;
  validCourses: number;
  excludedCourses: number;
  excludedCourseCodes: string[];
  summary: {
    completedCredits: number;
    remainingCredits: number;
    completionRate: string;
  };
}

export interface CourseDetailDto {
  courseCode: string;
  courseName: string | null;
  credits: number;
  rawScore: number | null;
  convertedScore: string | null;
  semester: string;
  year: string;
  isExcluded: boolean;
  exclusionReason?: string;
}
