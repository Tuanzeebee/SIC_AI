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
import { AutoPredictionTriggerService } from './auto-prediction-trigger.service';

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
  constructor(
    private readonly partTimeHourSaveService: PartTimeHourSaveService,
    private readonly autoPredictionTriggerService: AutoPredictionTriggerService
  ) {}

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

  @Put('update-part-time-hours-with-prediction')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  async updatePartTimeHoursWithPrediction(@Body() updatePartTimeHoursDto: UpdatePartTimeHoursDto) {
    try {
      const result = await this.partTimeHourSaveService.updatePartTimeHoursWithAutoPrediction(updatePartTimeHoursDto);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi cập nhật part-time hours và tự động dự đoán',
      };
    }
  }

  @Post('trigger-auto-prediction/:userId')
  @HttpCode(HttpStatus.OK)
  async triggerAutoPredictionForUser(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const result = await this.autoPredictionTriggerService.triggerForAllCompleteRecords(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi trigger tự động dự đoán',
      };
    }
  }

  @Post('trigger-auto-prediction/:userId/:recordId')
  @HttpCode(HttpStatus.OK)
  async triggerAutoPredictionForRecord(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('recordId', ParseIntPipe) recordId: number
  ) {
    try {
      const result = await this.autoPredictionTriggerService.triggerOnRawScoreUpdate(userId, recordId);
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi trigger tự động dự đoán cho record',
      };
    }
  }

  @Post('update-part-time-hours-with-smart-prediction')
  @HttpCode(HttpStatus.OK)
  async updatePartTimeHoursWithSmartPrediction(@Body() body: {
    userId: number;
    partTimeHours: number;
    viewMode: 'semester' | 'full';
    semesterPartTimeHours?: {[key: string]: number};
  }) {
    try {
      // First update part-time hours in all relevant records
      const updateResult = await this.partTimeHourSaveService.updatePartTimeHoursWithAutoPrediction({
        userId: body.userId,
        partTimeHours: body.partTimeHours,
        viewMode: body.viewMode,
        semesterPartTimeHours: body.semesterPartTimeHours,
      });

      if (!updateResult.success) {
        return updateResult;
      }

      // Then trigger auto prediction ONLY for records that have rawScore > 0
      const predictionResult = await this.autoPredictionTriggerService.triggerForAllCompleteRecords(body.userId);

      return {
        success: true,
        message: 'Đã cập nhật part-time hours và tự động dự đoán cho các môn có điểm số',
        data: {
          updateResult,
          predictionResult,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Lỗi khi cập nhật part-time hours và tự động dự đoán',
      };
    }
  }

  @Get('check-part-time-hours/:userId')
  @HttpCode(HttpStatus.OK)
  async checkPartTimeHoursExists(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const result = await this.partTimeHourSaveService.checkPartTimeHoursExists(userId);
      return result;
    } catch (error) {
      return {
        success: false,
        hasPartTimeHours: false,
        message: error.message || 'Lỗi khi kiểm tra dữ liệu part-time hours',
      };
    }
  }
}
