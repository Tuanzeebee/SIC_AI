import { 
  Controller, 
  Get, 
  Query, 
  ParseIntPipe, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { CalculatorGpaService } from './calculator-gpa.service';
import { 
  GetGpaDto, 
  GpaResultDto, 
  DetailedGpaResultDto 
} from './dto/calculator-gpa.dto';

@Controller('api/calculator-gpa')
export class CalculatorGpaController {
  constructor(private readonly calculatorGpaService: CalculatorGpaService) {}

  /**
   * Get cumulative GPA for a user (all semesters)
   */
  @Get('cumulative')
  async getCumulativeGpa(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<{ success: boolean; data: GpaResultDto; message: string }> {
    try {
      const result = await this.calculatorGpaService.getCumulativeGpa(userId);
      
      return {
        success: true,
        data: result,
        message: 'GPA tích lũy được tính thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Lỗi khi tính GPA tích lũy',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get GPA for a specific semester
   */
  @Get('semester')
  async getGpaBySemester(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('year') year: string,
    @Query('semesterNumber', ParseIntPipe) semesterNumber: number,
  ): Promise<{ success: boolean; data: GpaResultDto; message: string }> {
    try {
      if (!year) {
        throw new HttpException(
          {
            success: false,
            message: 'Năm học là bắt buộc',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.calculatorGpaService.getGpaBySemester(
        userId,
        year,
        semesterNumber,
      );
      
      return {
        success: true,
        data: result,
        message: `GPA kỳ ${semesterNumber} năm ${year} được tính thành công`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          message: 'Lỗi khi tính GPA theo kỳ',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get detailed GPA calculation with breakdown
   */
  @Get('detailed')
  async getDetailedGpa(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('year') year?: string,
    @Query('semesterNumber') semesterNumber?: string,
  ): Promise<{ success: boolean; data: DetailedGpaResultDto; message: string }> {
    try {
      const dto: GetGpaDto = { userId };
      
      if (year) {
        dto.year = year;
      }
      
      if (semesterNumber) {
        dto.semesterNumber = parseInt(semesterNumber);
      }

      const result = await this.calculatorGpaService.calculateGpaWithDetails(dto);
      
      let message = 'GPA chi tiết được tính thành công';
      if (year && semesterNumber) {
        message = `GPA chi tiết kỳ ${semesterNumber} năm ${year} được tính thành công`;
      } else if (year) {
        message = `GPA chi tiết năm ${year} được tính thành công`;
      }
      
      return {
        success: true,
        data: result,
        message,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Lỗi khi tính GPA chi tiết',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get GPA for all semesters
   */
  @Get('all-semesters')
  async getAllSemestersGpa(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<{ success: boolean; data: GpaResultDto[]; message: string }> {
    try {
      const result = await this.calculatorGpaService.getAllSemestersGpa(userId);
      
      return {
        success: true,
        data: result,
        message: 'GPA tất cả các kỳ được tính thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Lỗi khi tính GPA tất cả các kỳ',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get quick GPA statistics
   */
  @Get('quick-stats')
  async getQuickGpaStats(
    @Query('userId', ParseIntPipe) userId: number,
  ): Promise<{ 
    success: boolean; 
    data: {
      cumulativeGpa: number;
      totalCredits: number;
      recordsCount: number;
      latestSemesterGpa?: number;
      latestSemesterInfo?: string;
    }; 
    message: string 
  }> {
    try {
      // Get cumulative GPA
      const cumulativeResult = await this.calculatorGpaService.getCumulativeGpa(userId);
      
      // Get all semesters to find the latest one
      const allSemesters = await this.calculatorGpaService.getAllSemestersGpa(userId);
      
      let latestSemesterGpa: number | undefined;
      let latestSemesterInfo: string | undefined;
      
      if (allSemesters.length > 0) {
        // Semesters are already sorted by year and semester (desc)
        const latest = allSemesters[0];
        latestSemesterGpa = latest.gpa;
        latestSemesterInfo = `HK${latest.semesterNumber}-${latest.year}`;
      }
      
      return {
        success: true,
        data: {
          cumulativeGpa: cumulativeResult.gpa,
          totalCredits: cumulativeResult.totalCredits,
          recordsCount: cumulativeResult.recordsCount,
          latestSemesterGpa,
          latestSemesterInfo,
        },
        message: 'Thống kê GPA nhanh được tính thành công',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Lỗi khi tính thống kê GPA nhanh',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
