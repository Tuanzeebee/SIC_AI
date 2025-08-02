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

export default api;
