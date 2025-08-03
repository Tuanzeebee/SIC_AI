import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePredictionInputScoreDto {
  @IsOptional()
  @IsNumber()
  reverseInputId?: number;

  @IsString()
  year: string;

  @IsNumber()
  semesterNumber: number;

  @IsString()
  courseCode: string;

  @IsString()
  studyFormat: string;

  @IsNumber()
  creditsUnit: number;

  @IsOptional()
  @IsNumber()
  weeklyStudyHours?: number;

  @IsOptional()
  @IsNumber()
  attendancePercentage?: number;

  @IsOptional()
  @IsNumber()
  partTimeHours?: number;

  @IsOptional()
  @IsNumber()
  financialSupport?: number;

  @IsOptional()
  @IsNumber()
  emotionalSupport?: number;

  @IsOptional()
  @IsNumber()
  studyHoursXAttendance?: number;

  @IsOptional()
  @IsNumber()
  studyHoursXPartTime?: number;

  @IsOptional()
  @IsNumber()
  financialSupportXPartTime?: number;

  @IsOptional()
  @IsNumber()
  attendanceXEmotionalSupport?: number;

  @IsOptional()
  @IsNumber()
  fullInteractionFeature?: number;

  @IsString()
  mode: string;
}

export class CreateFromReverseDto {
  @IsNumber()
  reverseInputId: number;
}

export class PredictionInputScoreResponseDto {
  id: number;
  userId: number;
  reverseInputId?: number | null;
  year: string;
  semesterNumber: number;
  courseCode: string;
  studyFormat: string;
  creditsUnit: number;
  weeklyStudyHours?: number | null;
  attendancePercentage?: number | null;
  partTimeHours?: number | null;
  financialSupport?: number | null;
  emotionalSupport?: number | null;
  studyHoursXAttendance?: number | null;
  studyHoursXPartTime?: number | null;
  financialSupportXPartTime?: number | null;
  attendanceXEmotionalSupport?: number | null;
  fullInteractionFeature?: number | null;
  mode: string;
  createdAt: Date;
  updatedAt: Date;
}

// ML Service DTOs
export class MLPredictionDto {
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

export class MLPredictionResponseDto {
  predicted_score: number;
}
