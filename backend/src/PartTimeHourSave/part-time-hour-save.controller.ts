import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { IsNumber, IsString, IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { PartTimeHourSaveService, PartTimeHourSaveInputData } from './part-time-hour-save.service';

export class CreatePartTimeHourSaveDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  year: string;

  @IsNumber()
  @IsNotEmpty()
  semesterNumber: number;

  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @IsNumber()
  @IsNotEmpty()
  partTimeHours: number;

  @IsString()
  @IsIn(['semester', 'full'])
  @IsNotEmpty()
  viewMode: 'semester' | 'full';
}

export class UpdatePartTimeHourSaveDto {
  @IsNumber()
  @IsOptional()
  reversePredictionId?: number;

  @IsNumber()
  @IsOptional()
  scorePredictionId?: number;

  @IsNumber()
  @IsOptional()
  rawScore?: number;

  @IsNumber()
  @IsOptional()
  weeklyStudyHours?: number;

  @IsNumber()
  @IsOptional()
  attendancePercentage?: number;
}

export class UpdatePartTimeHoursDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  partTimeHours: number;

  @IsString()
  @IsIn(['semester', 'full'])
  @IsNotEmpty()
  viewMode: 'semester' | 'full';

  @IsOptional()
  semesterPartTimeHours?: {[key: string]: number}; // For semester mode
}

@Controller('api/part-time-hour-saves')
export class PartTimeHourSaveController {
  constructor(private readonly partTimeHourSaveService: PartTimeHourSaveService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  async createPartTimeHourSave(@Body() createPartTimeHourSaveDto: CreatePartTimeHourSaveDto) {
    try {
      const result = await this.partTimeHourSaveService.createPredictionInputs(createPartTimeHourSaveDto);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi tạo prediction inputs',
      };
    }
  }

  @Put('update')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async updatePartTimeHourSave(@Body() updatePartTimeHourSaveDto: UpdatePartTimeHourSaveDto) {
    try {
      const { 
        reversePredictionId, 
        scorePredictionId, 
        rawScore, 
        weeklyStudyHours, 
        attendancePercentage 
      } = updatePartTimeHourSaveDto;

      if (!reversePredictionId && !scorePredictionId) {
        return {
          success: false,
          message: 'Cần ít nhất một prediction ID để cập nhật',
        };
      }

      const result = await this.partTimeHourSaveService.updatePredictionWithUserInputs(
        reversePredictionId || 0,
        scorePredictionId || 0,
        rawScore,
        weeklyStudyHours,
        attendancePercentage
      );
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi cập nhật prediction inputs',
      };
    }
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserPartTimeHourSaves(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body?: { viewMode?: 'semester' | 'full' }
  ) {
    try {
      const result = await this.partTimeHourSaveService.getUserPredictions(userId, body?.viewMode);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách predictions',
        data: null,
      };
    }
  }

  @Get('semesters/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserSemesters(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const result = await this.partTimeHourSaveService.getUserSemesters(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi lấy danh sách học kỳ',
        data: [],
      };
    }
  }

  @Put('update-part-time-hours')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async updatePartTimeHours(@Body() updatePartTimeHoursDto: UpdatePartTimeHoursDto) {
    try {
      const result = await this.partTimeHourSaveService.updatePartTimeHours(updatePartTimeHoursDto);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi cập nhật part-time hours',
      };
    }
  }
}
