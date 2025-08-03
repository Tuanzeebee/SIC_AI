import { useState, useEffect } from 'react';
import { predictedScoreApi } from '../services/predictedScoreApi';
import type { ScoreRecordWithPrediction } from '../services/predictedScoreApi';

export const useCourseData = (userId?: number) => {
  const [courses, setCourses] = useState<ScoreRecordWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    withPredictions: number;
    withoutPredictions: number;
  } | null>(null);

  // Get userId from localStorage if not provided
  const getCurrentUserId = (): number => {
    if (userId) return userId;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUserId = getCurrentUserId();
      const result = await predictedScoreApi.getScoreRecordsWithPredictions(currentUserId);
      
      if (result.success && result.data) {
        setCourses(result.data.data);
        setSummary(result.data.summary);
      } else {
        setError(result.error || 'Không thể tải dữ liệu môn học');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  return {
    courses,
    loading,
    error,
    summary,
    refetch: fetchCourses
  };
};
