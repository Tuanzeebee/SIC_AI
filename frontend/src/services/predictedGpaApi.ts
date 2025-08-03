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

export interface PredictedGpaStats {
  predictedGpa: number;
  predictedAcademicRank: string;
  totalPredictedCourses: number;
  totalPredictedCredits: number;
  averagePredictedScore: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const predictedGpaApi = {
  // Calculate predicted GPA from PredictedScore table
  calculatePredictedGpa: async (userId: number): Promise<ApiResponse<PredictedGpaStats>> => {
    try {
      const response = await api.get(`/predicted-gpa/calculate/${userId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to calculate predicted GPA'
      };
    }
  }
};

export default predictedGpaApi;
