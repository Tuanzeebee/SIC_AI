import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateScoreRecordDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  year: string;

  @IsNumber()
  @IsNotEmpty()
  semesterNumber: number;

  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @IsString()
  @IsOptional()
  courseName?: string;

  @IsString()
  @IsNotEmpty()
  studyFormat: string;

  @IsNumber()
  @IsNotEmpty()
  creditsUnit: number;

  @IsNumber()
  @IsOptional()
  rawScore?: number;

  @IsNumber()
  @IsOptional()
  convertedNumericScore?: number;

  @IsString()
  @IsOptional()
  convertedScore?: string;
}
