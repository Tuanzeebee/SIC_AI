import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CalculatorCreditService } from './calculator-credit.service';

@Controller('api/calculator-credit')
export class CalculatorCreditController {
  constructor(private readonly calculatorCreditService: CalculatorCreditService) {}

  /**
   * Get comprehensive academic statistics for a user
   * GET /api/calculator-credit/academic-statistics/:userId
   */
  @Get('academic-statistics/:userId')
  @HttpCode(HttpStatus.OK)
  async getAcademicStatistics(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const statistics = await this.calculatorCreditService.calculateAcademicStatistics(userId);
      return {
        success: true,
        message: 'Lấy thống kê học tập thành công',
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy thống kê học tập',
        error: error.message,
      };
    }
  }

  /**
   * Get detailed course information for a user
   * GET /api/calculator-credit/course-details/:userId
   */
  @Get('course-details/:userId')
  @HttpCode(HttpStatus.OK)
  async getCourseDetails(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const courseDetails = await this.calculatorCreditService.getCourseDetails(userId);
      return {
        success: true,
        message: 'Lấy chi tiết môn học thành công',
        data: courseDetails,
        count: courseDetails.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy chi tiết môn học',
        error: error.message,
      };
    }
  }

  /**
   * Get semester-wise statistics for a user
   * GET /api/calculator-credit/semester-statistics/:userId
   */
  @Get('semester-statistics/:userId')
  @HttpCode(HttpStatus.OK)
  async getSemesterStatistics(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const semesterStats = await this.calculatorCreditService.getSemesterStatistics(userId);
      return {
        success: true,
        message: 'Lấy thống kê theo học kỳ thành công',
        data: semesterStats,
        count: semesterStats.length,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy thống kê theo học kỳ',
        error: error.message,
      };
    }
  }

  /**
   * Get quick statistics for dashboard
   * GET /api/calculator-credit/quick-statistics/:userId
   */
  @Get('quick-statistics/:userId')
  @HttpCode(HttpStatus.OK)
  async getQuickStatistics(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const quickStats = await this.calculatorCreditService.getQuickStatistics(userId);
      return {
        success: true,
        message: 'Lấy thống kê nhanh thành công',
        data: quickStats,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy thống kê nhanh',
        error: error.message,
      };
    }
  }

  /**
   * Get earned credits only (simple endpoint)
   * GET /api/calculator-credit/earned-credits/:userId
   */
  @Get('earned-credits/:userId')
  @HttpCode(HttpStatus.OK)
  async getEarnedCredits(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const quickStats = await this.calculatorCreditService.getQuickStatistics(userId);
      return {
        success: true,
        message: 'Lấy tín chỉ đã học thành công',
        data: {
          earnedCredits: quickStats.earnedCredits,
          totalProgramCredits: 144,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy tín chỉ đã học',
        error: error.message,
      };
    }
  }

  /**
   * Get progress percentage only (simple endpoint)
   * GET /api/calculator-credit/progress/:userId
   */
  @Get('progress/:userId')
  @HttpCode(HttpStatus.OK)
  async getProgress(@Param('userId', ParseIntPipe) userId: number) {
    try {
      const quickStats = await this.calculatorCreditService.getQuickStatistics(userId);
      return {
        success: true,
        message: 'Lấy tiến độ học tập thành công',
        data: {
          progressPercentage: quickStats.progressPercentage,
          earnedCredits: quickStats.earnedCredits,
          totalProgramCredits: 144,
          remainingCredits: 144 - quickStats.earnedCredits,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi lấy tiến độ học tập',
        error: error.message,
      };
    }
  }
}
