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

export interface PredictionStatus {
  totalRecords: number;
  readyForPrediction: number;
  alreadyPredicted: number;
  missingData: number;
}

export interface PredictionSummary {
  processedCount: number;
  createdCount: number;
  skippedCount: number;
  errorCount: number;
  errors: string[];
}

export interface MLConnectionTest {
  isConnected: boolean;
  error?: string;
}

export interface CompleteWorkflowResult {
  populateMedianResult: {
    updatedCount: number;
    totalCoursesProcessed: number;
  };
  recalculateResult: {
    updatedCount: number;
    totalCoursesProcessed: number;
  };
  predictionResult: PredictionSummary;
  success: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PredictedScoreRecord {
  id: number;
  predictedScore: number;
  PredictedconvertedNumericScore?: number;
  PredictedconvertedScore?: string;
  semesterNumber: number;
  courseCode: string;
  studyFormat: string;
  creditsUnit: number;
  year: string;
  createdAt: string;
}

export interface ScoreRecordWithPrediction {
  // Course Information
  courseCode: string;
  courseName?: string;
  studyFormat: string; // LOẠI MÔN
  creditsUnit: number; // TÍN CHỈ
  year: string;
  semesterNumber: number;
  
  // Original scores
  rawScore?: number;
  convertedNumericScore?: number;
  convertedScore?: string;
  
  // Predicted scores
  predictedScore?: number; // ĐIỂM DỰ ĐOÁN
  predictedConvertedNumericScore?: number;
  predictedConvertedScore?: string;
  
  // Additional info
  id: number;
  createdAt: string;
  hasPrediction: boolean;
}

export const predictedScoreApi = {
  // Test ML connection
  testMLConnection: async (): Promise<ApiResponse<MLConnectionTest>> => {
    try {
      const response = await api.get('/predicted-score/test-ml-connection');
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to test ML connection'
      };
    }
  },

  // Get predicted scores by user ID
  getByUserId: async (userId: number): Promise<ApiResponse<PredictedScoreRecord[]>> => {
    try {
      const response = await api.get(`/predicted-score/user/${userId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get predicted scores'
      };
    }
  },

  // Get score records with predictions by user ID
  getScoreRecordsWithPredictions: async (userId: number): Promise<ApiResponse<{
    data: ScoreRecordWithPrediction[];
    summary: {
      total: number;
      withPredictions: number;
      withoutPredictions: number;
    };
  }>> => {
    try {
      const response = await api.get(`/predicted-score/score-records-with-predictions/${userId}`);
      return {
        success: true,
        data: {
          data: response.data.data,
          summary: response.data.summary
        },
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get score records with predictions'
      };
    }
  },

  // Get prediction status
  getStatus: async (): Promise<ApiResponse<PredictionStatus>> => {
    try {
      const response = await api.get('/predicted-score/status');
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get prediction status'
      };
    }
  },

  // Populate predictions
  populate: async (): Promise<ApiResponse<PredictionSummary>> => {
    try {
      const response = await api.post('/predicted-score/populate');
      return {
        success: true,
        data: response.data.summary,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to populate predictions'
      };
    }
  },

  // Complete workflow: populate medians + recalculate + predict
  completeWorkflow: async (): Promise<ApiResponse<CompleteWorkflowResult>> => {
    try {
      const response = await api.post('/predicted-score/complete-workflow');
      return {
        success: true,
        data: response.data,
        message: response.data.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to complete workflow'
      };
    }
  }
};

export default predictedScoreApi;
