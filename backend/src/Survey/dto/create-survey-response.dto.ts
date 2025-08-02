import { IsNotEmpty, IsArray, ValidateNested, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class SurveyAnswerDto {
  @IsNumber()
  @IsNotEmpty()
  questionId: number;

  // Cho phép answer là string hoặc array of strings
  @IsOptional()
  answer?: string | string[];

  @IsString()
  @IsNotEmpty()
  category: string;
}

export class CreateSurveyResponseDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SurveyAnswerDto)
  responses: SurveyAnswerDto[];
}
