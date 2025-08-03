import { IsNotEmpty, IsNumber, IsString, IsOptional, IsInt } from 'class-validator';

export class CreatePredictionReverseDto {
  @IsNotEmpty()
  @IsString()
  year: string;

  @IsNotEmpty()
  @IsInt()
  semesterNumber: number;

  @IsNotEmpty()
  @IsString()
  courseCode: string;

  @IsNotEmpty()
  @IsString()
  studyFormat: string;

  @IsNotEmpty()
  @IsInt()
  creditsUnit: number;

  @IsOptional()
  @IsNumber()
  rawScore?: number;

  @IsOptional()
  @IsNumber()
  partTimeHours?: number;

  @IsOptional()
  @IsInt()
  financialSupport?: number;

  @IsOptional()
  @IsInt()
  emotionalSupport?: number;
}

export class PredictionReverseResponseDto {
  id: number;
  userId: number;
  year: string;
  semesterNumber: number;
  courseCode: string;
  studyFormat: string;
  creditsUnit: number;
  rawScore?: number | null;
  partTimeHours?: number | null;
  financialSupport?: number | null;
  emotionalSupport?: number | null;
  financialSupportXPartTime?: number | null;
  rawScoreXPartTime?: number | null;
  rawScoreXFinancial?: number | null;
  rawScoreXEmotional?: number | null;
  rawScoreXPartTimeFinancial?: number | null;
  predictedWeeklyStudyHours?: number | null;
  predictedAttendancePercentage?: number | null;
  mode: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MLReversePredictionDto {
  semester_number: number;
  course_code: string;
  study_format: string;
  credits_unit: number;
  raw_score: number;
  part_time_hours: number;
  financial_support: number;
  emotional_support: number;
}

export class MLReversePredictionResponseDto {
  mode: string;
  predicted_weekly_study_hours: number;
  predicted_attendance_percentage: number;
}
