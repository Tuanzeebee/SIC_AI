import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  message: string;
  user?: T;
  isOverwrite?: boolean;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<ApiResponse<User>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/auth/user/${id}`);
    return response.data;
  },

  getUserByEmail: async (email: string): Promise<User> => {
    const response = await api.get(`/auth/user/email/${email}`);
    return response.data;
  },
};

// Survey API
export interface SurveyAnswerData {
  questionId: number;
  answer: string | string[]; // Hỗ trợ cả single và multiple selection
  category: string;
}

export interface SurveyResponseData {
  userId: number;
  responses: SurveyAnswerData[];
}

export const surveyApi = {
  submitResponse: async (data: SurveyResponseData): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/survey-responses', data);
    return response.data;
  },

  getUserHistory: async (userId: number): Promise<any> => {
    const response = await api.get(`/api/survey-responses/user/${userId}`);
    return response.data;
  },

  checkUserHasPreviousResponse: async (userId: number): Promise<any> => {
    const response = await api.get(`/api/survey-responses/user/${userId}/check`);
    return response.data;
  },

  getActiveQuestions: async (): Promise<any> => {
    const response = await api.get('/api/survey-questions/active');
    return response.data;
  },

  // Survey Analysis APIs
  analyzeSurvey: async (userId: number): Promise<any> => {
    const response = await api.post(`/api/survey-analysis/${userId}`);
    return response.data;
  },

  getLatestAnalysis: async (userId: number): Promise<any> => {
    const response = await api.get(`/api/survey-analysis/${userId}/latest`);
    return response.data;
  },

  getAnalysisHistory: async (userId: number): Promise<any> => {
    const response = await api.get(`/api/survey-analysis/${userId}/history`);
    return response.data;
  },
};

// Score Record API
export interface ScoreRecord {
  id: number;
  userId: number;
  studentId: string;
  year: string;
  semesterNumber: number;
  courseCode: string;
  courseName?: string;
  studyFormat: string;
  creditsUnit: number;
  rawScore?: number;
  convertedNumericScore?: number;
  convertedScore?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    created: {
      scoreRecords: number;
      predictionInputsReverse: number;
      predictionInputsScore: number;
    };
    total: number;
    sample: ScoreRecord[];
    message: string;
  };
  error?: string;
}

export interface PredictionInputReverse {
  id: number;
  userId: number;
  semesterNumber: number;
  courseCode: string;
  studyFormat: string;
  creditsUnit: number;
  rawScore: number;
  partTimeHours: number;
  financialSupport: number;
  emotionalSupport: number;
  financialSupportXPartTime: number;
  rawScoreXPartTime: number;
  rawScoreXFinancial: number;
  rawScoreXEmotional: number;
  rawScoreXPartTimeFinancial: number;
  predictedWeeklyStudyHours: number;
  predictedAttendancePercentage: number;
  mode: string;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionInputScore {
  id: number;
  userId: number;
  reverseInputId?: number;
  semesterNumber: number;
  courseCode: string;
  studyFormat: string;
  creditsUnit: number;
  weeklyStudyHours: number;
  attendancePercentage: number;
  partTimeHours: number;
  financialSupport: number;
  emotionalSupport: number;
  studyHoursXAttendance: number;
  studyHoursXPartTime: number;
  financialSupportXPartTime: number;
  attendanceXEmotionalSupport: number;
  fullInteractionFeature: number;
  mode: string;
  createdAt: string;
  updatedAt: string;
}

export const scoreRecordApi = {
  uploadCsv: async (userId: number, file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/api/score-records/upload-csv/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getByUserId: async (userId: number): Promise<{ success: boolean; data: ScoreRecord[]; count: number }> => {
    const response = await api.get(`/api/score-records/user/${userId}`);
    return response.data;
  },

  getAll: async (): Promise<{ success: boolean; data: ScoreRecord[]; count: number }> => {
    const response = await api.get('/api/score-records');
    return response.data;
  },

  // New endpoints for prediction inputs
  getPredictionInputsReverseByUserId: async (userId: number): Promise<{ success: boolean; data: PredictionInputReverse[]; count: number }> => {
    const response = await api.get(`/api/score-records/prediction-reverse/user/${userId}`);
    return response.data;
  },

  getPredictionInputsScoreByUserId: async (userId: number): Promise<{ success: boolean; data: PredictionInputScore[]; count: number }> => {
    const response = await api.get(`/api/score-records/prediction-score/user/${userId}`);
    return response.data;
  },

  getAllPredictionInputsReverse: async (): Promise<{ success: boolean; data: PredictionInputReverse[]; count: number }> => {
    const response = await api.get('/api/score-records/prediction-reverse');
    return response.data;
  },

  getAllPredictionInputsScore: async (): Promise<{ success: boolean; data: PredictionInputScore[]; count: number }> => {
    const response = await api.get('/api/score-records/prediction-score');
    return response.data;
  },
};

// Prediction API
export interface PredictionInputData {
  userId: number;
  year: string;
  semesterNumber: number;
  courseCode: string;
  partTimeHours: number;
  viewMode: 'semester' | 'full';
}

export interface UpdatePredictionData {
  reversePredictionId?: number;
  scorePredictionId?: number;
  rawScore?: number;
  weeklyStudyHours?: number;
  attendancePercentage?: number;
}

export interface UpdatePartTimeHoursData {
  userId: number;
  partTimeHours: number;
  viewMode: 'semester' | 'full';
  semesterPartTimeHours?: {[key: string]: number}; // For semester mode
}

export const partTimeHourSaveApi = {
  create: async (data: PredictionInputData): Promise<{ success: boolean; message: string; data?: any }> => {
    const response = await api.post('/api/part-time-hour-saves/create', data);
    return response.data;
  },

  update: async (data: UpdatePredictionData): Promise<{ success: boolean; message: string; updates?: any[] }> => {
    const response = await api.put('/api/part-time-hour-saves/update', data);
    return response.data;
  },

  getUserPartTimeHourSaves: async (userId: number, viewMode?: 'semester' | 'full'): Promise<{ success: boolean; data: any; message?: string }> => {
    const response = await api.get(`/api/part-time-hour-saves/user/${userId}`, {
      data: viewMode ? { viewMode } : undefined
    });
    return response.data;
  },

  getUserSemesters: async (userId: number): Promise<{ success: boolean; data: Array<{year: string, semesterNumber: number, label: string}>; message?: string }> => {
    const response = await api.get(`/api/part-time-hour-saves/semesters/${userId}`);
    return response.data;
  },

  updatePartTimeHours: async (data: UpdatePartTimeHoursData): Promise<{ success: boolean; message: string; data?: any }> => {
    const response = await api.put('/api/part-time-hour-saves/update-part-time-hours', data);
    return response.data;
  },
};

export default api;
