import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetGpaDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  semesterNumber?: number;
}

export class GpaResultDto {
  gpa: number;
  totalCredits: number;
  totalWeightedScore: number;
  recordsCount: number;
  year?: string;
  semesterNumber?: number;
}

export class GpaCalculationDetailDto {
  courseCode: string;
  courseName?: string;
  convertedNumericScore: number;
  creditsUnit: number;
  weightedScore: number;
  year: string;
  semesterNumber: number;
}

export class DetailedGpaResultDto extends GpaResultDto {
  details: GpaCalculationDetailDto[];
}
