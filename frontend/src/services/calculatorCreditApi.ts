import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface AcademicStatistics {
  totalProgramCredits: number;
  earnedCredits: number;
  progressPercentage: number;
  gpa: number;
  academicRank: string;
  totalCourses: number;
  validCourses: number;
  excludedCourses: number;
  excludedCourseCodes: string[];
  summary: {
    completedCredits: number;
    remainingCredits: number;
    completionRate: string;
  };
}

export interface CourseDetail {
  courseCode: string;
  courseName: string | null;
  credits: number;
  rawScore: number | null;
  convertedScore: string | null;
  semester: string;
  year: string;
  isExcluded: boolean;
  exclusionReason?: string;
}

export interface SemesterStatistic {
  semester: string;
  totalCourses: number;
  validCourses: number;
  excludedCourses: number;
  earnedCredits: number;
  gpa: number;
  academicRank: string;
}

export interface QuickStatistics {
  earnedCredits: number;
  progressPercentage: number;
  gpa: number;
  academicRank: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
  error?: string;
}

// Calculator Credit API methods
export const calculatorCreditApi = {
  // Get comprehensive academic statistics
  getAcademicStatistics: async (userId: number): Promise<ApiResponse<AcademicStatistics>> => {
    try {
      const response = await api.get(`/api/calculator-credit/academic-statistics/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching academic statistics:', error);
      throw error;
    }
  },

  // Get detailed course information
  getCourseDetails: async (userId: number): Promise<ApiResponse<CourseDetail[]>> => {
    try {
      const response = await api.get(`/api/calculator-credit/course-details/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching course details:', error);
      throw error;
    }
  },

  // Get semester-wise statistics
  getSemesterStatistics: async (userId: number): Promise<ApiResponse<SemesterStatistic[]>> => {
    try {
      const response = await api.get(`/api/calculator-credit/semester-statistics/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching semester statistics:', error);
      throw error;
    }
  },

  // Get quick statistics for dashboard
  getQuickStatistics: async (userId: number): Promise<ApiResponse<QuickStatistics>> => {
    try {
      const response = await api.get(`/api/calculator-credit/quick-statistics/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching quick statistics:', error);
      throw error;
    }
  },

  // Get earned credits only
  getEarnedCredits: async (userId: number): Promise<ApiResponse<{ earnedCredits: number; totalProgramCredits: number }>> => {
    try {
      const response = await api.get(`/api/calculator-credit/earned-credits/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching earned credits:', error);
      throw error;
    }
  },

  // Get progress percentage only
  getProgress: async (userId: number): Promise<ApiResponse<{ 
    progressPercentage: number; 
    earnedCredits: number; 
    totalProgramCredits: number; 
    remainingCredits: number 
  }>> => {
    try {
      const response = await api.get(`/api/calculator-credit/progress/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  },
};
