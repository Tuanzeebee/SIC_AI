import { useState, useEffect } from "react";
import { surveyApi } from "../services/api";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ToastContainer";
import "./AnalysisResultPage.css";

interface AnalysisResult {
  id: number;
  userId: number;
  emotionalLevel: number;
  financialLevel: number;
  createdAt: string;
  updatedAt: string;
}

export const AnalysisResultPage = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    // Lấy user ID từ localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userIdStr = String(user.id);
        fetchAnalysisResult(parseInt(userIdStr));
      } catch (err) {
        console.error("Lỗi khi parse user data:", err);
        window.location.href = '/login';
        return;
      }
    } else {
      window.location.href = '/login';
      return;
    }
  }, []);

  const fetchAnalysisResult = async (currentUserId: number) => {
    try {
      setLoading(true);
      const response = await surveyApi.getLatestAnalysis(currentUserId);
      
      if (response.success) {
        setAnalysisResult(response.result);
      } else {
        setError("Chưa có kết quả phân tích. Vui lòng làm khảo sát trước.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải kết quả phân tích:", err);
      setError("Không thể tải kết quả phân tích. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const getLevelText = (level: number): string => {
    switch (level) {
      case 0: return "Thấp";
      case 1: return "Trung bình";
      case 2: return "Cao";
      case 3: return "Rất cao";
      default: return "Chưa xác định";
    }
  };

  const getLevelColor = (level: number): string => {
    switch (level) {
      case 0: return "level-low";
      case 1: return "level-medium";
      case 2: return "level-high";
      case 3: return "level-very-high";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="analysis-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải kết quả phân tích...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button
            onClick={() => window.location.href = '/survey'}
            className="retry-button"
          >
            Làm khảo sát
          </button>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="analysis-page">
        <div className="no-result-container">
          <h2>Chưa có kết quả phân tích</h2>
          <p>Vui lòng làm khảo sát để nhận được kết quả phân tích.</p>
          <button
            onClick={() => window.location.href = '/survey'}
            className="survey-button"
          >
            Làm khảo sát
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <div className="analysis-container">
        <h1 className="page-title">Kết quả phân tích khảo sát</h1>
        
        <div className="analysis-content">
          <div className="analysis-card">
            <h3>Mức độ hỗ trợ tinh thần</h3>
            <div className={`level-badge ${getLevelColor(analysisResult.emotionalLevel)}`}>
              <span className="level-number">{analysisResult.emotionalLevel}</span>
              <span className="level-text">{getLevelText(analysisResult.emotionalLevel)}</span>
            </div>
          </div>

          <div className="analysis-card">
            <h3>Mức độ hỗ trợ tài chính</h3>
            <div className={`level-badge ${getLevelColor(analysisResult.financialLevel)}`}>
              <span className="level-number">{analysisResult.financialLevel}</span>
              <span className="level-text">{getLevelText(analysisResult.financialLevel)}</span>
            </div>
          </div>
        </div>

        <div className="analysis-info">
          <p className="analysis-date">
            Phân tích vào: {new Date(analysisResult.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => window.location.href = '/survey'}
            className="redo-survey-button"
          >
            Làm lại khảo sát
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="home-button"
          >
            Về trang chủ
          </button>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
