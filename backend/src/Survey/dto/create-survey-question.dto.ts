import { IsString, IsArray, IsEnum, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export enum QuestionCategory {
  GENERAL = 'GENERAL',
  EMOTIONAL = 'EMOTIONAL',
  FINANCIAL = 'FINANCIAL',
}

export class CreateSurveyQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(QuestionCategory)
  category: QuestionCategory;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsBoolean()
  @IsOptional()
  allowMultiple?: boolean; // Thêm field cho multiple selection
}
