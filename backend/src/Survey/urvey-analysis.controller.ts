import { Controller, Post, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SurveyAnalysisService } from './survey-analysis.service';

@Controller('api/survey-analysis')
export class SurveyAnalysisController {
  constructor(private readonly analysisService: SurveyAnalysisService) {}

  @Post(':userId')
  async analyze(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const result = await this.analysisService.analyzeSurvey(userId);
      return {
        success: true,
        result,
        message: 'Phân tích khảo sát thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Lỗi khi phân tích khảo sát'
      };
    }
  }

  @Get(':userId/latest')
  async getLatestAnalysis(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const result = await this.analysisService.getLatestAnalysis(userId);
      if (!result) {
        return {
          success: false,
          message: 'Chưa có kết quả phân tích nào'
        };
      }
      return {
        success: true,
        result,
        message: 'Lấy kết quả phân tích thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Lỗi khi lấy kết quả phân tích'
      };
    }
  }

  @Get(':userId/history')
  async getAnalysisHistory(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const results = await this.analysisService.getAnalysisHistory(userId);
      return {
        success: true,
        results,
        count: results.length,
        message: 'Lấy lịch sử phân tích thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Lỗi khi lấy lịch sử phân tích'
      };
    }
  }

  // Debug endpoint để xem tất cả dữ liệu SurveyAnalysisResult
  @Get('debug/all')
  async getAllAnalysisResults() {
    try {
      const results = await this.analysisService.getAllAnalysisResults();
      return {
        success: true,
        results,
        count: results.length,
        message: 'Lấy tất cả kết quả phân tích thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Lỗi khi lấy tất cả kết quả phân tích'
      };
    }
  }
}
