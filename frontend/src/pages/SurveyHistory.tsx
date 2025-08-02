// SurveyHistory.tsx
import { useState, useEffect } from "react";
import { surveyApi } from "../services/api";
import "./SurveyHistory.css";

interface SurveyHistoryItem {
  id: number;
  submittedAt: string;
  answers: Array<{
    id: number;
    selectedOption: string;
    question: {
      id: number;
      text: string;
      category: string;
    };
  }>;
}

export const SurveyHistory = () => {
  const [history, setHistory] = useState<SurveyHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveyHistory();
  }, []);

  const fetchSurveyHistory = async () => {
    try {
      // Lấy user ID từ localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        window.location.href = '/login';
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id;

      const historyData = await surveyApi.getUserHistory(userId);
      setHistory(historyData);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử khảo sát:", err);
      setError("Không thể tải lịch sử khảo sát.");
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EMOTIONAL': return '#e74c3c';
      case 'FINANCIAL': return '#3498db';
      case 'GENERAL': return '#95a5a6';
      default: return '#333';
    }
  };

  if (loading) {
    return (
      <div className="survey-history-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải lịch sử khảo sát...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="survey-history-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchSurveyHistory}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-history-container">
      <h1>Lịch sử khảo sát</h1>
      
      {history.length === 0 ? (
        <div className="no-history">
          <p>Bạn chưa có lịch sử khảo sát nào.</p>
          <button onClick={() => window.location.href = '/survey'}>
            Làm khảo sát ngay
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-header">
                <h3>Khảo sát #{item.id}</h3>
                <span className="date">{formatDate(item.submittedAt)}</span>
              </div>
              
              <div className="answers-grid">
                {item.answers.map((answer) => (
                  <div key={answer.id} className="answer-item">
                    <div 
                      className="category-badge"
                      style={{ backgroundColor: getCategoryColor(answer.question.category) }}
                    >
                      {answer.question.category}
                    </div>
                    <div className="question-text">{answer.question.text}</div>
                    <div className="answer-text">{answer.selectedOption}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="actions">
        <button onClick={() => window.location.href = '/'}>
          Về trang chủ
        </button>
        <button onClick={() => window.location.href = '/survey'}>
          Làm khảo sát mới
        </button>
      </div>
    </div>
  );
};
