import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calculatorGpaApi, calculatorCreditApi, predictedGpaApi } from "../services/api";
import { useCourseData } from "../hooks/useCourseData";
import "./PreLearingPath.css";

export const PreLearningPath = (): React.JSX.Element => {
  const navigate = useNavigate();
  
  // State for academic statistics (using same pattern as TutorialPrediction)
  const [academicStats, setAcademicStats] = useState<{
    earnedCredits: number;
    progressPercentage: number;
    gpa: number;
    academicRank: string;
  } | null>(null);
  const [predictedGpa, setPredictedGpa] = useState<number>(0);
  const [predictedAcademicRank, setPredictedAcademicRank] = useState<string>('Chưa có dữ liệu');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Use course data hook
  const { courses, loading: coursesLoading, error: coursesError } = useCourseData();

  // Get user from localStorage
  const getUserId = (): number | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    return null;
  };

  // Fetch current GPA and credit data (using same pattern as TutorialPrediction)
  const fetchCurrentStats = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      // Fetch GPA data separately (thang điểm 4.0)
      const gpaResult = await calculatorGpaApi.getQuickStats(userId);
      
      // Fetch credit data separately (thang điểm 10.0)
      const creditResult = await calculatorCreditApi.getQuickStatistics(userId);

      if (gpaResult.success && creditResult.success) {
        // Use Credit API for most data (as it has more comprehensive calculation)
        // and GPA API specifically for 4.0 scale GPA
        setAcademicStats({
          earnedCredits: creditResult.data.earnedCredits,
          progressPercentage: creditResult.data.progressPercentage,
          gpa: gpaResult.data.cumulativeGpa, // Use 4.0 scale from GPA API
          academicRank: gpaResult.data.cumulativeGpa >= 3.6 ? 'Xuất sắc' :
                       gpaResult.data.cumulativeGpa >= 3.2 ? 'Giỏi' :
                       gpaResult.data.cumulativeGpa >= 2.5 ? 'Khá' :
                       gpaResult.data.cumulativeGpa >= 2.0 ? 'Trung bình' : 'Yếu'
        });
      } else if (gpaResult.success) {
        // Only GPA data available
        setAcademicStats({
          earnedCredits: gpaResult.data.totalCredits, // Fallback to GPA API's totalCredits
          progressPercentage: 0, // No progress data available
          gpa: gpaResult.data.cumulativeGpa,
          academicRank: gpaResult.data.cumulativeGpa >= 3.6 ? 'Xuất sắc' :
                       gpaResult.data.cumulativeGpa >= 3.2 ? 'Giỏi' :
                       gpaResult.data.cumulativeGpa >= 2.5 ? 'Khá' :
                       gpaResult.data.cumulativeGpa >= 2.0 ? 'Trung bình' : 'Yếu'
        });
      } else if (creditResult.success) {
        // Only credit data available - use Credit API's GPA (thang 10.0) and convert rank
        setAcademicStats({
          earnedCredits: creditResult.data.earnedCredits,
          progressPercentage: creditResult.data.progressPercentage,
          gpa: creditResult.data.gpa, // This is on 10.0 scale
          academicRank: creditResult.data.academicRank // Use Credit API's ranking
        });
      }
    } catch (error) {
      console.error('Error fetching current stats:', error);
    }
  };

  // Fetch predicted GPA data
  const fetchPredictedStats = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const result = await predictedGpaApi.calculatePredictedGpa(userId);
      
      if (result.success && result.data) {
        setPredictedGpa(result.data.predictedGpa);
        setPredictedAcademicRank(result.data.predictedAcademicRank);
      }
    } catch (error) {
      console.error('Error fetching predicted stats:', error);
    }
  };

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchCurrentStats(),
        fetchPredictedStats()
      ]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Use same pattern as TutorialPrediction
  const currentGPA = academicStats?.gpa ?? 0;

  return (
    
    <div className="pre-learning-path">
            <button 
        className="course-detail-back-btn"
        onClick={() => window.location.href = '/tutorial'}
        title="Quay lại trang tutorial"
      >
        ← Quay lại
      </button>
      <div className="div">
        <div className="text-wrapper-36">Learning path</div>

        <div className="overlap">
          <div className="overlap-2">
            <div className="text-wrapper-28">GPA Hiện Tại</div>
            <div className="text-wrapper-29">{isLoading ? '...' : currentGPA.toFixed(2)}</div>
            <div className="text-wrapper-32">{isLoading ? '...' : (academicStats?.academicRank ?? 'Chưa có dữ liệu')}</div>
          </div>

          <div className="overlap-3">
            <div className="text-wrapper-30">GPA Dự Đoán</div>
            <div className="text-wrapper-31">{isLoading ? '...' : predictedGpa.toFixed(1)}</div>
            <div className="text-wrapper-32">{isLoading ? '...' : predictedAcademicRank}</div>
          </div>

          <div className="overlap-4">
            <div className="text-wrapper-33">Số Tín Chỉ Đã Học</div>
            <div className="text-wrapper-34">{isLoading ? '...' : (academicStats?.earnedCredits ?? 0)}</div>
            <div className="text-wrapper-35">Đã học</div>
          </div>
        </div>

        <div className="text-wrapper-27">Your Study list</div>

        {/* Course List Table */}
        <div className="course-list-container">
          <div className="course-table">
            {/* Table Header */}
            <div className="table-header">
              <div className="header-cell">MÔN HỌC</div>
              <div className="header-cell">LOẠI MÔN</div>
              <div className="header-cell">TÍN CHỈ</div>
              <div className="header-cell">ĐIỂM DỰ ĐOÁN</div>
              <div className="header-cell">HÀNH ĐỘNG</div>
            </div>

            {/* Table Body */}
            <div className="table-body">
              {coursesLoading ? (
                <div className="loading-message">
                  Đang tải dữ liệu môn học...
                </div>
              ) : coursesError ? (
                <div className="error-message">
                  Lỗi: {coursesError}
                </div>
              ) : courses.length === 0 ? (
                <div className="no-data-message">
                  Không có dữ liệu môn học
                </div>
              ) : (
                courses.slice(0, 5).map((course) => (
                  <div key={course.id} className="table-row">
                    <div className="table-cell course-name-cell">
                      <div className="course-code">{course.courseCode}</div>
                      {course.courseName && (
                        <div className="course-name">{course.courseName}</div>
                      )}
                    </div>
                    <div className="table-cell">
                      <span className="study-format-badge">
                        {course.studyFormat}
                      </span>
                    </div>
                    <div className="table-cell">{course.creditsUnit}</div>
                    <div className="table-cell">
                      <span className={`predicted-score ${course.hasPrediction ? 'has-prediction' : 'no-prediction'}`}>
                        {course.hasPrediction 
                          ? course.predictedScore?.toFixed(1) 
                          : 'Chưa có dự đoán'
                        }
                      </span>
                    </div>
                    <div className="table-cell">
                      <button 
                        className="learn-button"
                        onClick={() => {
                          console.log(`Learn action for course: ${course.courseCode}`);
                          navigate('/course-detail');
                        }}
                      >
                        Learn
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
