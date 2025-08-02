import React from "react";
import "./QuestionCard.css";

interface QuestionCardProps {
  questionIndex: number;
  questionText: string;
  options: string[];
  onSelect: (answer: string) => void;
  onNext: () => void;
  onBack: () => void;
  selectedOption?: string | string[]; // Hỗ trợ cả single và multiple selection
  category?: string;
  totalQuestions?: number;
  isLastQuestion?: boolean;
  allowMultiple?: boolean; // Thêm prop để xác định loại selection
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionIndex,
  questionText,
  options,
  onSelect,
  onNext,
  onBack,
  selectedOption,
  category: _category,
  totalQuestions = 10,
  isLastQuestion = false,
  allowMultiple = false, // Default false để giữ backward compatibility
}) => {
  const progressPercent = Math.round(((questionIndex + 1) / totalQuestions) * 100);
  
  // Helper function để kiểm tra option có được chọn không
  const isOptionSelected = (option: string): boolean => {
    if (!selectedOption) return false;
    
    if (allowMultiple) {
      return Array.isArray(selectedOption) && selectedOption.includes(option);
    } else {
      return selectedOption === option;
    }
  };
  
  // Helper function để kiểm tra có câu trả lời được chọn không
  const hasSelectedOption = selectedOption && (
    (typeof selectedOption === 'string' && selectedOption.trim() !== "") ||
    (Array.isArray(selectedOption) && selectedOption.length > 0)
  );

  return (
    <div className="question">
      <div className="div">
        <p className="text-wrapper">
          Trả lời một số câu hỏi nhanh để chúng tôi giúp bạn phân tích mức độ hỗ
          trợ tài chính và tinh thần từ gia đình một cách chính xác nhất.
        </p>

        <div className="overlap">
          <p className="p">Câu hỏi {questionIndex + 1} / {totalQuestions}</p>
          <div className="text-wrapper-2">{progressPercent}%</div>

          <div className="overlap-group">
            <div
              className="rectangle"
              style={{ width: `${(progressPercent * 536) / 100}px` }}
            />
          </div>

          <p className="text-wrapper-3">{questionText}</p>
          
          {/* Hiển thị thông báo nếu cho phép multiple selection */}
          {allowMultiple && (
            <p className="multiple-selection-info">
              Có thể chọn nhiều lựa chọn
            </p>
          )}

          <div className={`div-wrapper ${isOptionSelected(options[0]) ? 'selected' : ''}`} onClick={() => onSelect(options[0])}>
            <div className="text-wrapper-4">{options[0]}</div>
          </div>

          <div className={`overlap-2 ${isOptionSelected(options[1]) ? 'selected' : ''}`} onClick={() => onSelect(options[1])}>
            <div className="text-wrapper-4">{options[1]}</div>
          </div>

          <div className={`overlap-3 ${isOptionSelected(options[2]) ? 'selected' : ''}`} onClick={() => onSelect(options[2])}>
            <div className="text-wrapper-4">{options[2]}</div>
          </div>

          <div className={`overlap-4 ${isOptionSelected(options[3]) ? 'selected' : ''}`} onClick={() => onSelect(options[3])}>
            <div className="text-wrapper-4">{options[3]}</div>
          </div>

            <button 
              className={`next-button ${!hasSelectedOption ? 'disabled' : ''}`} 
              onClick={onNext}
              disabled={!hasSelectedOption}
            >
                {isLastQuestion ? 'Hoàn thành' : 'Tiếp tục'}
            </button>
            </div>
            <button className="back-button" onClick={onBack}>
            Back
            </button>
      </div>
    </div>
  );
};