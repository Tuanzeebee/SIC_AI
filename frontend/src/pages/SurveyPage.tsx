// SurveyPage.tsx
import { useState, useEffect } from "react";
import { QuestionCard } from "./QuestionCard";
import { surveyApi } from "../services/api";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ToastContainer";
import type { SurveyResponseData } from "../services/api";

interface SurveyQuestion {
  id: number;
  text: string;
  category: string;
  options: string[];
  isActive: boolean;
  allowMultiple?: boolean; // Thêm field để xác định có cho phép chọn nhiều không
}

export const SurveyPage = () => {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>([]); // Hỗ trợ cả single và multiple answers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Toast hook
  const { toasts, showSuccess, showError, showWarning, removeToast } = useToast();

  useEffect(() => {
    // Lấy user ID từ localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const userIdStr = String(user.id); // Convert to string để đảm bảo consistency
        setUserId(userIdStr);
        
        // Gọi các function sau khi có userId
        fetchQuestions();
        checkPreviousResponse(parseInt(userIdStr));
      } catch (err) {
        console.error("Lỗi khi parse user data:", err);
        // Chuyển hướng về trang login nếu không có thông tin user hợp lệ
        window.location.href = '/login';
        return;
      }
    } else {
      // Chuyển hướng về trang login nếu chưa đăng nhập
      window.location.href = '/login';
      return;
    }
  }, []);

  const checkPreviousResponse = async (currentUserId: number) => {
    try {
      const checkResult = await surveyApi.checkUserHasPreviousResponse(currentUserId);
      
      if (checkResult.hasPreviousResponse) {
        // Hiển thị cảnh báo về việc ghi đè bằng toast warning
        showWarning("Bạn đã làm khảo sát trước đây. Kết quả cũ sẽ bị ghi đè nếu tiếp tục.", 5000);
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra previous response:", err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const activeQuestions = await surveyApi.getActiveQuestions();
      
      // Sắp xếp câu hỏi: EMOTIONAL trước, FINANCIAL sau, GENERAL cuối
      const sortedQuestions = activeQuestions.sort((a: SurveyQuestion, b: SurveyQuestion) => {
        const categoryOrder = { EMOTIONAL: 1, FINANCIAL: 2, GENERAL: 3 };
        return categoryOrder[a.category as keyof typeof categoryOrder] - 
               categoryOrder[b.category as keyof typeof categoryOrder];
      });
      
      setQuestions(sortedQuestions);
      // Khởi tạo answers array với empty strings cho single selection
      // và empty arrays cho multiple selection
      const initialAnswers = sortedQuestions.map((question: SurveyQuestion) => 
        question.allowMultiple ? [] : ""
      );
      setAnswers(initialAnswers);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi khi tải câu hỏi:", err);
      setError("Không thể tải câu hỏi. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleSelect = (answer: string) => {
    const newAnswers = [...answers];
    const currentQuestion = questions[step];
    
    if (currentQuestion.allowMultiple) {
      // Xử lý multiple selection
      const currentAnswers = Array.isArray(newAnswers[step]) ? newAnswers[step] as string[] : [];
      const answerIndex = currentAnswers.indexOf(answer);
      
      if (answerIndex > -1) {
        // Nếu đã chọn thì bỏ chọn
        currentAnswers.splice(answerIndex, 1);
      } else {
        // Nếu chưa chọn thì thêm vào
        currentAnswers.push(answer);
      }
      
      newAnswers[step] = currentAnswers;
    } else {
      // Xử lý single selection
      newAnswers[step] = answer;
    }
    
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    // Kiểm tra xem người dùng đã chọn câu trả lời chưa
    const currentAnswer = answers[step];
    const hasAnswer = currentAnswer && (
      (typeof currentAnswer === 'string' && currentAnswer.trim() !== "") ||
      (Array.isArray(currentAnswer) && currentAnswer.length > 0)
    );
    
    if (!hasAnswer) {
      showError("Vui lòng chọn một câu trả lời trước khi tiếp tục!");
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      submitSurvey();
    }
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  const submitSurvey = async () => {
    try {
      // Kiểm tra xem có userId không
      if (!userId) {
        showError("Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      const surveyData: SurveyResponseData = {
        userId: parseInt(userId),
        responses: questions.map((question, index) => ({
          questionId: question.id,
          answer: answers[index], // Giữ nguyên format (string hoặc string[])
          category: question.category
        }))
      };
      
      console.log("Dữ liệu khảo sát:", surveyData);
      
      // Gửi dữ liệu lên server
      const response = await surveyApi.submitResponse(surveyData);
      
      if (response) {
        console.log("Kết quả lưu khảo sát:", response);
        
        // Hiển thị thông báo phù hợp dựa trên việc có ghi đè hay không
        if (response.isOverwrite) {
          showSuccess("Khảo sát đã được cập nhật thành công! Kết quả cũ đã được ghi đè.");
        } else {
          showSuccess("Khảo sát đã được lưu thành công!");
        }
        
        // Chuyển hướng đến trang hoàn thành khảo sát ngay lập tức
        setTimeout(() => {
          window.location.href = '/complete';
        }, 3000);
      }
    } catch (err) {
      console.error("Lỗi khi gửi khảo sát:", err);
      showError("Có lỗi xảy ra khi gửi khảo sát! Vui lòng thử lại.");
    }
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  // Hiển thị error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchQuestions}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo nếu không có câu hỏi
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Chưa có câu hỏi khảo sát nào được kích hoạt.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <QuestionCard
        questionIndex={step}
        questionText={questions[step].text}
        options={questions[step].options}
        onSelect={handleSelect}
        onNext={handleNext}
        onBack={handleBack}
        selectedOption={answers[step]}
        category={questions[step].category}
        totalQuestions={questions.length}
        isLastQuestion={step === questions.length - 1}
        allowMultiple={questions[step].allowMultiple} // Truyền thêm prop allowMultiple
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};