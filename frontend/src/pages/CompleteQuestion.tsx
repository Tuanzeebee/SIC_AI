import { useState, useEffect } from "react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ToastContainer";
import { surveyApi } from "../services/api";
import "./CompleteQuestion.css";

interface AnalysisResult {
  id: number;
  userId: number;
  emotionalLevel: number;
  financialLevel: number;
  createdAt: string;
  updatedAt: string;
}

export const CompleteQuestion = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, toasts, removeToast } = useToast();

  const getLevelText = (level: number): string => {
    switch (level) {
      case 0: return "Thấp";
      case 1: return "Trung bình";
      case 2: return "Cao";
      case 3: return "Rất cao";
      default: return "Chưa xác định";
    }
  };

  useEffect(() => {
    const fetchAnalysisResult = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          showError('Không tìm thấy thông tin người dùng');
          setLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        if (!user.id) {
          showError('Không tìm thấy ID người dùng');
          setLoading(false);
          return;
        }

        // Sử dụng surveyApi để lấy kết quả phân tích mới nhất
        const response = await surveyApi.getLatestAnalysis(user.id);
        
        if (response.success && response.result) {
          setAnalysisResult(response.result);
          showSuccess("Đã tải kết quả phân tích!");
        } else {
          // Nếu chưa có kết quả, thử tạo phân tích mới
          const analysisResponse = await surveyApi.analyzeSurvey(user.id);
          
          if (analysisResponse.success && analysisResponse.result) {
            setAnalysisResult(analysisResponse.result);
            showSuccess("Phân tích khảo sát hoàn tất!");
          } else {
            showError("Chưa có kết quả phân tích. Vui lòng làm khảo sát trước.");
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy kết quả phân tích:', error);
        showError("Có lỗi xảy ra khi tải kết quả phân tích.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResult();
  }, [showSuccess, showError]);
  const handleBack = () => {
    window.location.href = '/';
  };

  const handleRetakeSurvey = () => {
    window.location.href = '/survey';
  };

  const handleGoToTutorial = () => {
    window.location.href = '/tutorial';
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="complete-question">
      <div className="div">
        <div className="group">
          <div className="overlap-group-wrapper">
            <div className="overlap-group" onClick={handleBack} style={{ cursor: 'pointer' }}>
              <div className="chevron-left">
              </div>

              <div className="text-wrapper">Back</div>
            </div>
          </div>
        </div>

        <div className="overlap">
          <div className="div-wrapper">
            <div className="text-wrapper-2">✓</div>
          </div>

          <div className="text-wrapper-3">Hoàn thành khảo sát!</div>

          <p className="p">
            Cảm ơn bạn đã trả lời! Chúng tôi đã phân tích dữ liệu và đánh giá 
            mức độ hỗ trợ của bạn như sau:
          </p>

          {loading ? (
            <div className="text-wrapper-4">Đang phân tích...</div>
          ) : analysisResult ? (
            <div className="text-wrapper-4">
              Hỗ trợ TINH THẦN: {getLevelText(analysisResult.emotionalLevel)}<br/>
              Hỗ trợ TÀI CHÍNH: {getLevelText(analysisResult.financialLevel)}
            </div>
          ) : (
            <div className="text-wrapper-4">Chưa có kết quả phân tích</div>
          )}

          <div className="overlap-2" onClick={handleRetakeSurvey} style={{ cursor: 'pointer' }}>
            <div className="text-wrapper-5">Làm lại khảo sát</div>
          </div>
          <div className="overlap-3" onClick={handleGoToTutorial} style={{ cursor: 'pointer' }}>
            <div className="text-wrapper-6">Đến trang dự đoán</div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
