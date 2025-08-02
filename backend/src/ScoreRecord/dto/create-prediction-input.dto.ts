import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePredictionInputReverseDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  semesterNumber: number;

  @IsString()
  courseCode: string;

  @IsString()
  studyFormat: string;

  @IsNumber()
  creditsUnit: number;

  @IsNumber()
  rawScore: number;

  @IsNumber()
  @IsOptional()
  partTimeHours?: number;

  @IsNumber()
  @IsOptional()
  financialSupport?: number;

  @IsNumber()
  @IsOptional()
  emotionalSupport?: number;

  @IsNumber()
  @IsOptional()
  financialSupportXPartTime?: number;

  @IsNumber()
  @IsOptional()
  rawScoreXPartTime?: number;

  @IsNumber()
  @IsOptional()
  rawScoreXFinancial?: number;

  @IsNumber()
  @IsOptional()
  rawScoreXEmotional?: number;

  @IsNumber()
  @IsOptional()
  rawScoreXPartTimeFinancial?: number;

  @IsNumber()
  @IsOptional()
  predictedWeeklyStudyHours?: number;

  @IsNumber()
  @IsOptional()
  predictedAttendancePercentage?: number;

  @IsString()
  mode: string;
}

export class CreatePredictionInputScoreDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @IsOptional()
  reverseInputId?: number;

  @IsNumber()
  semesterNumber: number;

  @IsString()
  courseCode: string;

  @IsString()
  studyFormat: string;

  @IsNumber()
  creditsUnit: number;

  @IsNumber()
  @IsOptional()
  weeklyStudyHours?: number;

  @IsNumber()
  @IsOptional()
  attendancePercentage?: number;

  @IsNumber()
  @IsOptional()
  partTimeHours?: number;

  @IsNumber()
  @IsOptional()
  financialSupport?: number;

  @IsNumber()
  @IsOptional()
  emotionalSupport?: number;

  @IsNumber()
  @IsOptional()
  studyHoursXAttendance?: number;

  @IsNumber()
  @IsOptional()
  studyHoursXPartTime?: number;

  @IsNumber()
  @IsOptional()
  financialSupportXPartTime?: number;

  @IsNumber()
  @IsOptional()
  attendanceXEmotionalSupport?: number;

  @IsNumber()
  @IsOptional()
  fullInteractionFeature?: number;

  @IsString()
  mode: string;
}
