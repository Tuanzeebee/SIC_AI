import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface GpaResult {
  gpa: number;
  totalCredits: number;
  totalWeightedScore: number;
  recordsCount: number;
  year?: string;
  semesterNumber?: number;
}

export interface GpaCalculationDetail {
  courseCode: string;
  courseName?: string;
  convertedNumericScore: number;
  creditsUnit: number;
  weightedScore: number;
  year: string;
  semesterNumber: number;
}

export interface DetailedGpaResult extends GpaResult {
  details: GpaCalculationDetail[];
}

export interface QuickGpaStats {
  cumulativeGpa: number;
  totalCredits: number;
  recordsCount: number;
  latestSemesterGpa?: number;
  latestSemesterInfo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const calculatorGpaApi = {
  /**
   * Get cumulative GPA (all semesters)
   */
  getCumulativeGpa: async (userId: number): Promise<ApiResponse<GpaResult>> => {
    try {
      const response = await api.get('/api/calculator-gpa/cumulative', {
        params: { userId },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting cumulative GPA:', error);
      return {
        success: false,
        data: {
          gpa: 0,
          totalCredits: 0,
          totalWeightedScore: 0,
          recordsCount: 0,
        },
        message: error.response?.data?.message || 'Lỗi khi lấy GPA tích lũy',
      };
    }
  },

  /**
   * Get GPA for a specific semester
   */
  getGpaBySemester: async (
    userId: number,
    year: string,
    semesterNumber: number,
  ): Promise<ApiResponse<GpaResult>> => {
    try {
      const response = await api.get('/api/calculator-gpa/semester', {
        params: { userId, year, semesterNumber },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting semester GPA:', error);
      return {
        success: false,
        data: {
          gpa: 0,
          totalCredits: 0,
          totalWeightedScore: 0,
          recordsCount: 0,
          year,
          semesterNumber,
        },
        message: error.response?.data?.message || 'Lỗi khi lấy GPA theo kỳ',
      };
    }
  },

  /**
   * Get detailed GPA calculation with breakdown
   */
  getDetailedGpa: async (
    userId: number,
    year?: string,
    semesterNumber?: number,
  ): Promise<ApiResponse<DetailedGpaResult>> => {
    try {
      const params: any = { userId };
      if (year) params.year = year;
      if (semesterNumber !== undefined) params.semesterNumber = semesterNumber;

      const response = await api.get('/api/calculator-gpa/detailed', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting detailed GPA:', error);
      return {
        success: false,
        data: {
          gpa: 0,
          totalCredits: 0,
          totalWeightedScore: 0,
          recordsCount: 0,
          details: [],
          year,
          semesterNumber,
        },
        message: error.response?.data?.message || 'Lỗi khi lấy GPA chi tiết',
      };
    }
  },

  /**
   * Get GPA for all semesters
   */
  getAllSemestersGpa: async (userId: number): Promise<ApiResponse<GpaResult[]>> => {
    try {
      const response = await api.get('/api/calculator-gpa/all-semesters', {
        params: { userId },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting all semesters GPA:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Lỗi khi lấy GPA tất cả các kỳ',
      };
    }
  },

  /**
   * Get quick GPA statistics
   */
  getQuickStats: async (userId: number): Promise<ApiResponse<QuickGpaStats>> => {
    try {
      const response = await api.get('/api/calculator-gpa/quick-stats', {
        params: { userId },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting quick GPA stats:', error);
      return {
        success: false,
        data: {
          cumulativeGpa: 0,
          totalCredits: 0,
          recordsCount: 0,
        },
        message: error.response?.data?.message || 'Lỗi khi lấy thống kê GPA nhanh',
      };
    }
  },
};
