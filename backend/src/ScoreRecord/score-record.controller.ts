import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScoreRecordService } from './score-record.service';
import { CreateScoreRecordDto } from './dto/create-score-record.dto';

@Controller('api/score-records')
export class ScoreRecordController {
  constructor(private readonly scoreRecordService: ScoreRecordService) {}

  // Upload CSV file and bulk create score records
  @Post('upload-csv/:userId')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadCsvFile(
    @Param('userId', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        return {
          success: false,
          message: 'Không có file được tải lên',
        };
      }

      if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
        return {
          success: false,
          message: 'Chỉ hỗ trợ file CSV',
        };
      }

      const result = await this.scoreRecordService.uploadCsvFile(userId, file);
      return {
        success: true,
        message: result.message || 'Tải lên file CSV và tạo dữ liệu prediction thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi tải lên file CSV',
        error: error.message,
      };
    }
  }

  // Create single score record
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createScoreRecord(@Body() createScoreRecordDto: CreateScoreRecordDto) {
    try {
      const result = await this.scoreRecordService.create(createScoreRecordDto);
      return {
        success: true,
        message: 'Tạo điểm số thành công',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi tạo điểm số',
        error: error.message,
      };
    }
  }

  // Get score records by user ID
  @Get('user/:userId')
  async getScoreRecordsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const results = await this.scoreRecordService.findByUserId(userId);
      return {
        success: true,
        message: 'Lấy danh sách điểm số thành công',
        data: results,
        count: results.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách điểm số',
        error: error.message,
      };
    }
  }

  // Get all score records
  @Get()
  async getAllScoreRecords() {
    try {
      const results = await this.scoreRecordService.findAll();
      return {
        success: true,
        message: 'Lấy tất cả điểm số thành công',
        data: results,
        count: results.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy tất cả điểm số',
        error: error.message,
      };
    }
  }

  // Get prediction inputs reverse by user ID
  @Get('prediction-reverse/user/:userId')
  async getPredictionInputsReverseByUserId(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const results = await this.scoreRecordService.findPredictionInputsReverseByUserId(userId);
      return {
        success: true,
        message: 'Lấy danh sách prediction inputs reverse thành công',
        data: results,
        count: results.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách prediction inputs reverse',
        error: error.message,
      };
    }
  }

  // Get prediction inputs score by user ID
  @Get('prediction-score/user/:userId')
  async getPredictionInputsScoreByUserId(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const results = await this.scoreRecordService.findPredictionInputsScoreByUserId(userId);
      return {
        success: true,
        message: 'Lấy danh sách prediction inputs score thành công',
        data: results,
        count: results.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy danh sách prediction inputs score',
        error: error.message,
      };
    }
  }

  // Get all prediction inputs reverse
  @Get('prediction-reverse')
  async getAllPredictionInputsReverse() {
    try {
      const results = await this.scoreRecordService.getAllPredictionInputsReverse();
      return {
        success: true,
        message: 'Lấy tất cả prediction inputs reverse thành công',
        data: results,
        count: results.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy tất cả prediction inputs reverse',
        error: error.message,
      };
    }
  }

  // Get all prediction inputs score
  @Get('prediction-score')
  async getAllPredictionInputsScore() {
    try {
      const results = await this.scoreRecordService.getAllPredictionInputsScore();
      return {
        success: true,
        message: 'Lấy tất cả prediction inputs score thành công',
        data: results,
        count: results.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy tất cả prediction inputs score',
        error: error.message,
      };
    }
  }
}
