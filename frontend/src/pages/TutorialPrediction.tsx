import React, { useState, useEffect } from "react";
import { scoreRecordApi, partTimeHourSaveApi, calculatorGpaApi, calculatorCreditApi, predictionReverseApi, predictionInputScoreApi } from "../services/api";
import { predictedScoreApi } from "../services/predictedScoreApi";
import type { ScoreRecord } from "../services/api";
import { useLayoutToast } from "../contexts/ToastContext";
import "./TutorialPrediction.css";

// Import placeholder images - you may need to replace these with actual image paths
import vector1 from "../assets/tinchi.svg";
import vector2 from "../assets/tiendo.svg";
import vector3 from "../assets/ngoisao.svg";
export const Tutorial = (): React.JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('tutorial');
  const [viewMode, setViewMode] = useState<string>('semester'); // 'semester' for Theo Kỳ, 'full' for Full
  const [partTimeHours, setPartTimeHours] = useState<number>(0);
  
  // Toast hook - using layout toast since we're inside MainLayout
  const { showSuccess, showError } = useLayoutToast();
  
  // New state for semester-specific part-time hours
  const [semesterPartTimeHours, setSemesterPartTimeHours] = useState<{[key: string]: number}>({});
  
  // State for data fetching
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [scoreRecords, setScoreRecords] = useState<ScoreRecord[]>([]);
  
  // New state for available semesters from API
  const [availableSemesters, setAvailableSemesters] = useState<Array<{year: string, semesterNumber: number, label: string}>>([]);

  // New state for prediction results
  const [predictionResults, setPredictionResults] = useState<any[]>([]);

  // New state for academic statistics from API
  const [academicStats, setAcademicStats] = useState<{
    earnedCredits: number;
    progressPercentage: number;
    gpa: number;
    academicRank: string;
  } | null>(null);

  // New state to check if user has partTimeHours data for navigation button
  const [hasPartTimeHoursData, setHasPartTimeHoursData] = useState<boolean>(false);
  const [isCheckingPartTimeHours, setIsCheckingPartTimeHours] = useState<boolean>(false);

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

  // Fetch available semesters from API
  const fetchAvailableSemesters = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const result = await partTimeHourSaveApi.getUserSemesters(userId);
      if (result.success) {
        setAvailableSemesters(result.data);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  // Fetch academic statistics from API
  const fetchAcademicStatistics = async () => {
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
      console.error('Error fetching academic statistics:', error);
    }
  };

  // Helper function to get unique semesters - now uses API data
  const getUniqueSemesters = (): Array<{year: string, semesterNumber: number, label: string}> => {
    // Use API data if available, otherwise fallback to scoreRecords
    if (availableSemesters.length > 0) {
      // Process API data to convert HK3 to HK Hè
      return availableSemesters.map(semester => ({
        ...semester,
        label: semester.semesterNumber === 3 
          ? `HK Hè-${semester.year}` 
          : semester.label.includes('HK3') 
            ? semester.label.replace('HK3', 'HK Hè')
            : semester.label
      }));
    }

    // Fallback to the old method using scoreRecords
    const semesterSet = new Set<string>();
    const semesters: Array<{year: string, semesterNumber: number, label: string}> = [];
    
    scoreRecords.forEach(record => {
      const key = `${record.year}-HK${record.semesterNumber}`;
      if (!semesterSet.has(key)) {
        semesterSet.add(key);
        const semesterLabel = record.semesterNumber === 3 ? 'HK Hè' : `HK${record.semesterNumber}`;
        semesters.push({
          year: record.year,
          semesterNumber: record.semesterNumber,
          label: `${semesterLabel}-${record.year}`
        });
      }
    });
    
    // Sort by year and semester
    semesters.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year.localeCompare(b.year);
      }
      return a.semesterNumber - b.semesterNumber;
    });
    
    return semesters;
  };

  // Handle semester-specific part-time hours change
  const handleSemesterPartTimeChange = (semesterKey: string, value: number) => {
    setSemesterPartTimeHours(prev => ({
      ...prev,
      [semesterKey]: value
    }));
  };

  // Function to check if user has partTimeHours data in PredictionInputReverse
  const checkPartTimeHoursData = async () => {
    const userId = getUserId();
    if (!userId) return;

    setIsCheckingPartTimeHours(true);
    try {
      const result = await partTimeHourSaveApi.checkPartTimeHoursExists(userId);
      if (result.success) {
        setHasPartTimeHoursData(result.hasPartTimeHours);
      }
    } catch (error) {
      console.error('Error checking partTimeHours data:', error);
      setHasPartTimeHoursData(false);
    } finally {
      setIsCheckingPartTimeHours(false);
    }
  };

  // Auto-fetch semesters when component mounts
  useEffect(() => {
    fetchAvailableSemesters();
    fetchAcademicStatistics();
    checkPartTimeHoursData(); // Check partTimeHours data when component mounts
  }, []); // Empty dependency array means this runs once when component mounts

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        showError('Chỉ hỗ trợ file CSV');
      }
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    fileInput?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      showError('Vui lòng chọn file CSV');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      showError('Vui lòng đăng nhập để tải lên file');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await scoreRecordApi.uploadCsv(userId, file);
      
      if (result.success) {
        showSuccess('Upload file thành công!');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        // Refresh academic statistics after upload
        await fetchAcademicStatistics();
      } else {
        showError(result.message || 'Lỗi khi tải lên file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Lỗi khi tải lên file. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchData = async () => {
    const userId = getUserId();
    if (!userId) {
      showError('Vui lòng đăng nhập để xem dữ liệu');
      return;
    }

    setIsFetchingData(true);

    try {
      // Fetch available semesters first
      await fetchAvailableSemesters();

      // Update part-time hours in database first with auto prediction
      const updateData = {
        userId,
        partTimeHours,
        viewMode: viewMode as 'semester' | 'full',
        semesterPartTimeHours: viewMode === 'semester' ? semesterPartTimeHours : undefined
      };

      console.log('Sending update data with auto prediction:', updateData); // Debug log

      // Use the new auto prediction endpoint
      const updateResult = await partTimeHourSaveApi.updatePartTimeHoursWithAutoPrediction(updateData);
      console.log('Update result with auto prediction:', updateResult); // Debug log
      
      if (!updateResult.success) {
        console.error('Update error:', updateResult.message); // Debug log
        showError(`Lỗi khi lưu part-time hours: ${updateResult.message}`);
        return;
      }

      // Fetch ScoreRecord data
      const scoreRecordsResult = await scoreRecordApi.getByUserId(userId);
      console.log('Score records result:', scoreRecordsResult); // Debug log
      
      if (scoreRecordsResult.success) {
        setScoreRecords(scoreRecordsResult.data);
      }

      // Refresh academic statistics after updating data
      await fetchAcademicStatistics();

      // Filter data based on viewMode if needed
      let filteredScoreRecords = scoreRecordsResult.data || [];

      if (viewMode === 'semester') {
        // Show success message for semester mode with prediction info
        const predictionCount = updateResult.data?.predictionResult?.data?.length || 0;
        showSuccess(`Đã tải và lưu dữ liệu theo kỳ thành công${predictionCount > 0 ? ` và tự động dự đoán ${predictionCount} môn học` : ''}`);
      } else {
        // Full mode - show all data with prediction info
        const predictionCount = updateResult.data?.predictionResult?.data?.length || 0;
        showSuccess(`Đã tải và lưu toàn bộ dữ liệu thành công${predictionCount > 0 ? ` và tự động dự đoán ${predictionCount} môn học` : ''}`);
      }

      console.log('ScoreRecords:', filteredScoreRecords);
      console.log('ViewMode:', viewMode);
      console.log('PartTimeHours:', partTimeHours);
      console.log('Update Result with Auto Prediction:', updateResult);
      
      // Log prediction results if available
      if (updateResult.data?.predictionResult?.data?.length > 0) {
        console.log('Auto Prediction Results:', updateResult.data.predictionResult.data);
        setPredictionResults(updateResult.data.predictionResult.data);
      } else {
        setPredictionResults([]);
      }

    } catch (error: any) {
      console.error('Fetch data error:', error);
      // More detailed error logging
      if (error.response) {
        console.error('Error response:', error.response.data);
        showError(`Lỗi API: ${error.response.data.message || error.message}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        showError('Lỗi kết nối tới server. Vui lòng kiểm tra backend có đang chạy không.');
      } else {
        console.error('Error message:', error.message);
        showError('Lỗi khi tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setIsFetchingData(false);
      // Recheck partTimeHours data after updating
      await checkPartTimeHoursData();
    }
  };

  // Handle navigation to next page
  const handleNavigateToNextPage = async () => {
    setIsCheckingPartTimeHours(true);
    
    try {
      showSuccess('Đang xử lý workflow hoàn chỉnh: lưu dữ liệu → lấy trung vị → dự đoán điểm...');
      
      // Step 1: Check how many completed reverse predictions exist
      const allCompletedResult = await predictionReverseApi.getAllCompleted();
      
      if (allCompletedResult.success && allCompletedResult.data && allCompletedResult.data.length > 0) {
        // Step 2: Create forward predictions from ALL reverse predictions (with selective overwrite)
        showSuccess('Đang chuyển đổi dữ liệu dự đoán ngược...');
        const transferResult = await predictionInputScoreApi.createFromAllReverse();
        
        let transferMessage = `Chuyển đổi dữ liệu: `;
        const transferDetails = [];
        
        if (transferResult.created > 0) {
          transferDetails.push(`${transferResult.created} môn mới`);
        }
        if (transferResult.overwritten > 0) {
          transferDetails.push(`${transferResult.overwritten} môn cập nhật`);
        }
        if (transferResult.skipped > 0) {
          transferDetails.push(`${transferResult.skipped} môn bỏ qua`);
        }
        
        transferMessage += transferDetails.join(', ');
        showSuccess(transferMessage);

        // Step 3: Execute complete workflow (populate medians + recalculate + predict)
        showSuccess('Đang thực hiện quy trình hoàn chỉnh...');
        const workflowResult = await predictedScoreApi.completeWorkflow();
        
        if (workflowResult.success && workflowResult.data) {
          const { populateMedianResult, recalculateResult, predictionResult } = workflowResult.data;
          
          // Show detailed success message
          const workflowDetails = [
            `Điền trung vị: ${populateMedianResult.updatedCount}/${populateMedianResult.totalCoursesProcessed}`,
            `Tính toán lại: ${recalculateResult.updatedCount}/${recalculateResult.totalCoursesProcessed}`,
            `Dự đoán điểm: ${predictionResult.createdCount}/${predictionResult.processedCount}`
          ];
          
          if (predictionResult.errorCount > 0) {
            showError(`Có ${predictionResult.errorCount} lỗi trong quá trình dự đoán`);
          }
          
          showSuccess(`✅ Hoàn thành workflow: ${workflowDetails.join(' | ')}`);
          
          // Navigate to next page after successful workflow
          setTimeout(() => {
            window.location.href = '/pre-learning-path';
          }, 4000); // 4 seconds to show all messages
        } else {
          throw new Error(workflowResult.error || 'Workflow thất bại');
        }
      } else {
        showError('Không tìm thấy dữ liệu dự đoán ngược hoàn chỉnh để chuyển đổi');
      }
    } catch (error) {
      console.error('Error in complete workflow:', error);
      showError('Có lỗi xảy ra trong quá trình workflow: ' + (error as Error).message);
    } finally {
      setIsCheckingPartTimeHours(false);
    }
  };

  const renderTutorialContent = () => (
    <div style={{ padding: '0 140px' }}>
      <h2 style={{ 
        color: '#3C315B', 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginBottom: '22px',
        marginLeft: '53px'
      }}>
        Hướng dẫn sử dụng hệ thống
      </h2>

      {/* Step 1 */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '24px',
        marginBottom: '32px',
        borderRadius: '15px',
        marginLeft: '0',
        marginRight: '124px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
          <button style={{
            backgroundColor: '#3C315B',
            color: 'white',
            padding: '6px 17px',
            borderRadius: '50px',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            1
          </button>
          <span style={{ color: '#3C315B', fontSize: '20px', fontWeight: 'bold' }}>
            Tải Student Grade Extractor 1.0
          </span>
        </div>
        <p style={{ color: '#374151', fontSize: '16px', marginBottom: '12px', marginLeft: '84px' }}>
          Tải và cài đặt tiện ích Student Grade Extractor 1.0 về máy tính của bạn từ Chrome Web Store hoặc Firefox Add-ons.
        </p>
        <div style={{
          backgroundColor: '#eef2ff',
          padding: '12px',
          borderRadius: '8px',
          marginLeft: '84px',
          display: 'flex',
          gap: '4px'
        }}>
          <span style={{ color: '#1e40af', fontSize: '14px', fontWeight: 'bold' }}>Lưu ý:</span>
          <span style={{ color: '#1e40af', fontSize: '14px' }}>
            Đảm bảo tiện ích được kích hoạt trong trình duyệt của bạn sau khi cài đặt.
          </span>
        </div>
      </div>

      {/* Step 2 */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '24px',
        marginBottom: '53px',
        borderRadius: '15px',
        marginRight: '124px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
          <button style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '6px 15px',
            borderRadius: '50px',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            2
          </button>
          <span style={{ color: '#3C315B', fontSize: '20px', fontWeight: 'bold' }}>
            Truy cập MyDTU và trích xuất điểm
          </span>
        </div>
        <p style={{ color: '#374151', fontSize: '16px', marginBottom: '16px', marginLeft: '84px' }}>
          Thực hiện các bước sau để trích xuất điểm số:
        </p>

        {[
          "Đăng nhập vào tài khoản MyDTU của bạn",
          'Vào mục "Học tập" trong menu chính',
          'Chọn "Bảng điểm" để xem điểm số của bạn',
          "Nhấp vào biểu tượng Extension trên thanh công cụ trình duyệt",
          'Chọn "Student Grade Extractor 1.0" từ danh sách tiện ích',
          'Nhấp vào nút "Trích xuất & Tải CSV"',
        ].map((text, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            marginLeft: '84px',
            gap: '12px'
          }}>
            <div style={{
              backgroundColor: '#10b981',
              width: '6px',
              height: '6px',
              borderRadius: '50%'
            }} />
            <span style={{ color: '#374151', fontSize: '15px' }}>{text}</span>
          </div>
        ))}

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '12px',
          borderRadius: '8px',
          marginLeft: '84px',
          display: 'flex',
          gap: '9px'
        }}>
          <span style={{ color: '#92400e', fontSize: '14px', fontWeight: 'bold' }}>Quan trọng:</span>
          <span style={{ color: '#92400e', fontSize: '14px' }}>
            File CSV sẽ được tải xuống máy tính của bạn. Hãy ghi nhớ vị trí lưu file để sử dụng ở bước tiếp theo.
          </span>
        </div>
      </div>

      {/* Step 3 */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '24px',
        marginBottom: '72px',
        borderRadius: '15px',
        marginRight: '124px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '6px 15px',
            borderRadius: '50px',
            border: 'none',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            3
          </button>
          <span style={{ color: '#3C315B', fontSize: '20px', fontWeight: 'bold' }}>
            Chuyển đến trang nhập điểm
          </span>
        </div>
        <p style={{ color: '#374151', fontSize: '16px', marginBottom: '16px', marginLeft: '84px' }}>
          Sau khi đã có file CSV, chuyển đến trang "Nhập bảng điểm" để tải lên và phân tích dữ liệu điểm số của bạn.
        </p>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginLeft: '84px'
          }}
        >
          Chuyển đến trang nhập bảng điểm →
        </button>
      </div>
    </div>
  );

  const OverviewScore = (): React.JSX.Element => {
    // Use API data if available, otherwise show default values
    const earnedCredits = academicStats?.earnedCredits ?? 0;
    const progress = academicStats?.progressPercentage ?? 0;
    const currentGPA = academicStats?.gpa ?? 0;
    const academicRank = academicStats?.academicRank ?? 'Chưa có dữ liệu';

    return (
      <div className="frame">
        <div className="div-4">
          <div className="overlap-group-wrapper">
            <div className="overlap-group">
              <div className="rectangle" />

                       <div className="div-5">
                <div className="div-10">
                  <div className="frame-wrapper">
                    <div className="vector-wrapper">
                      <img className="vector" alt="Vector" src={vector1} />
                    </div>
                  </div>
                  <div className="div-7">
                    <div className="div-9">
                      <div className="text-wrapper-10">📊</div>
                      <div className="text-wrapper-11">Tổng tín chỉ</div>
                    </div>
                    <div className="text-wrapper-12">144</div>
                  </div>
                </div>

                <div className="frame-wrapper-6">
                  <div className="div-12">
                    <div className="text-wrapper-13">🎯</div>
                    <div className="text-wrapper-14">Chương trình đào tạo</div>
                  </div>
                </div>
              </div>
              <div className="rectangle-2" />
            </div>
          </div>

          <div className="overlap-wrapper">
            <div className="overlap">
              <div className="rectangle-2" />

              <div className="div-5">
                <div className="div-10">
                  <div className="frame-wrapper-2">
                    <div className="vector-wrapper">
                      <img className="vector" alt="Vector" src={vector2} />
                    </div>
                  </div>

                  <div className="div-7">
                    <div className="div-11">
                      <div className="text-wrapper-10">✅</div>
                      <div className="text-wrapper-11">Tín chỉ đã học</div>
                    </div>
                    <div className="text-wrapper-12">{earnedCredits}</div>
                  </div>
                </div>

                <div className="frame-wrapper-3">
                  <div className="div-12">
                    <div className="text-wrapper-13">📈</div>
                    <div className="text-wrapper-14">Tiến độ: {progress}%</div>
                  </div>
                </div>
              </div>

              <div className="rectangle-3" />
            </div>
          </div>

          <div className="overlap-wrapper-2">
            <div className="overlap-group">
              <div className="rectangle-4" />

              <div className="div-5">
                <div className="div-13">
                  <div className="frame-wrapper-4">
                    <div className="vector-wrapper">
                      <img className="vector-2" alt="Vector" src={vector3} />
                    </div>
                  </div>

                  <div className="div-7">
                    <div className="div-14">
                      <div className="text-wrapper-15">⭐</div>
                      <div className="text-wrapper-16">GPA hiện tại (4.0)</div>
                    </div>
                    <div className="text-wrapper-17">{currentGPA.toFixed(2)}</div>
                  </div>
                </div>

                <div className="frame-wrapper-5">
                  <div className="div-15">
                    <div className="text-wrapper-18">🏆</div>
                    <div className="text-wrapper-19">Xếp loại: {academicRank}</div>
                  </div>
                </div>
              </div>

              <div className="rectangle-2" />
            </div>
          </div>
        </div>
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          marginTop: '30px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{
            color: '#3C315B',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Thông tin bổ sung
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <p style={{
              color: '#374151',
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Sử dụng biểu mẫu bên dưới để tạo prediction mới cho học kỳ hoặc toàn khóa học.
            </p>
          </div>
        </div>
        {/* Mode Selection - Moved below div-4 */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          marginTop: '20px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <h4 style={{
            color: '#3C315B',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Chế độ xem dữ liệu
          </h4>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="div-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                id="semester-mode"
                name="viewMode"
                value="semester"
                checked={viewMode === 'semester'}
                onChange={(e) => setViewMode(e.target.value)}
                style={{ margin: '0' }}
              />
              <label htmlFor="semester-mode" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <div className="text-wrapper">📚</div>
                <div className="text-wrapper-2">Theo Kỳ</div>
              </label>
            </div>

            <div className="div-3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="radio"
                id="full-mode"
                name="viewMode"
                value="full"
                checked={viewMode === 'full'}
                onChange={(e) => setViewMode(e.target.value)}
                style={{ margin: '0' }}
              />
              <label htmlFor="full-mode" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <div className="text-wrapper-3">🎯</div>
                <div className="text-wrapper-4">Full</div>
              </label>
            </div>
          </div>

          {/* Part Time Hours Input */}
          <div style={{ marginTop: '20px' }}>
            {viewMode === 'semester' ? (
              // Semester mode - show inputs for each semester
              <div>
                <h5 style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  margin: '0 0 16px 0'
                }}>
                  Thời gian đi làm theo từng học kỳ
                </h5>
                {getUniqueSemesters().map((semester) => {
                  const semesterKey = `${semester.year}-HK${semester.semesterNumber}`;
                  return (
                    <div key={semesterKey} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px',
                      padding: '12px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <span style={{
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        minWidth: '120px'
                      }}>
                        {semester.label}
                      </span>
                      <span style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        marginRight: '8px'
                      }}>
                        Thời gian đi làm
                      </span>
                      <select
                        value={semesterPartTimeHours[semesterKey] || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          handleSemesterPartTimeChange(semesterKey, value);
                        }}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          width: '90px',
                          textAlign: 'center',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {Array.from({ length: 61 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}
                          </option>
                        ))}
                      </select>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>giờ/tuần</span>
                    </div>
                  );
                })}
                {getUniqueSemesters().length === 0 && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '8px',
                    border: '1px solid #f59e0b',
                    textAlign: 'center'
                  }}>
                    <span style={{ color: '#92400e', fontSize: '14px' }}>
                      Vui lòng tải dữ liệu trước để hiển thị các học kỳ
                    </span>
                  </div>
                )}
                <div style={{
                  marginTop: '12px',
                  textAlign: 'center'
                }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>(0-60 giờ)</span>
                </div>
              </div>
            ) : (
              // Full mode - show single input
              <div>
                <label style={{
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Thời gian đi làm (giờ/tuần)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select
                    value={partTimeHours}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setPartTimeHours(value);
                    }}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      width: '120px',
                      textAlign: 'center',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {Array.from({ length: 61 }, (_, i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>giờ/tuần</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>(0-60 giờ)</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Button and Navigation Button */}
          <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleFetchData}
              disabled={isFetchingData}
              style={{
                padding: '12px 30px',
                fontSize: '14px',
                backgroundColor: isFetchingData ? '#6b7280' : '#3C315B',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isFetchingData ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.2s ease'
              }}
            >
              {isFetchingData ? 'Đang tải dữ liệu...' : 'Xác nhận'}
            </button>

            {/* Navigation Button - Only show if user has partTimeHours data */}
            {hasPartTimeHoursData && (
              <button
                onClick={handleNavigateToNextPage}
                disabled={isFetchingData || isCheckingPartTimeHours}
                style={{
                  padding: '12px 30px',
                  fontSize: '14px',
                  backgroundColor: (isFetchingData || isCheckingPartTimeHours) ? '#6b7280' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (isFetchingData || isCheckingPartTimeHours) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease'
                }}
              >
                {isCheckingPartTimeHours ? 'Đang thực hiện workflow...' : 'Tiếp tục & Dự đoán điểm →'}
              </button>
            )}
          </div>

          {/* Prediction Results Display */}
          {predictionResults.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #22c55e',
              borderRadius: '12px',
              width: '100%'
            }}>
              <h4 style={{
                color: '#15803d',
                fontSize: '16px',
                fontWeight: 'bold',
                margin: '0 0 16px 0',
                textAlign: 'center'
              }}>
                🎯 Kết quả dự đoán tự động ({predictionResults.length} môn học)
              </h4>
              
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {predictionResults.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {result.courseCode}
                      </span>
                      <span style={{
                        color: result.success ? '#15803d' : '#dc2626',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {result.success ? '✅ Thành công' : '❌ Lỗi'}
                      </span>
                    </div>
                    
                    {result.success && result.predictions ? (
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '13px',
                        color: '#6b7280'
                      }}>
                        <span>
                          📚 Giờ học/tuần: <strong>{result.predictions.predicted_weekly_study_hours?.toFixed(1)}</strong>
                        </span>
                        <span>
                          🎯 Tỷ lệ tham gia: <strong>{result.predictions.predicted_attendance_percentage?.toFixed(1)}%</strong>
                        </span>
                      </div>
                    ) : (
                      <span style={{
                        color: '#dc2626',
                        fontSize: '12px'
                      }}>
                        {result.error || 'Không thể dự đoán'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>



        {/* Additional Information Section - Moved to bottom */}
      </div>
    );
  };

  const renderOverviewContent = () => (
    <div>
      <OverviewScore />
    </div>
  );

  const renderUploadContent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      padding: '40px 20px 60px 20px',
      margin: '0 auto',
      maxWidth: '600px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      <span style={{
        color: '#3C315B',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        Tải lên file điểm CSV
      </span>
      
      {/* Hidden file input */}
      <input
        id="csv-file-input"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 60px 60px 60px',
          borderRadius: '12px',
          border: file ? '2px solid #10b981' : '2px dashed #d1d5db',
          backgroundColor: file ? '#f0fdf4' : 'white',
          minWidth: '400px',
          transition: 'all 0.3s ease'
        }}>
          <button
            type="button"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: file ? '#10b981' : '#3C315B',
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              width: '60px',
              height: '60px',
              transition: 'transform 0.2s ease'
            }}
            onClick={handleUploadClick}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          
          >
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/N1bPFEGoXY/c0gf0356_expires_30_days.png"
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              alt="Upload Icon"
            />
          </button>
          
          {file ? (
            <div style={{ textAlign: 'center' }}>
              <span style={{
                color: '#065f46',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                display: 'block'
              }}>
                ✅ File đã chọn: {file.name}
              </span>
              <span style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Kích thước: {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          ) : (
            <>
              <span style={{
                color: '#374151',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Kéo thả file CSV vào đây hoặc
              </span>
              
              <button
                type="button"
                style={{
                  backgroundColor: '#3C315B',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={handleUploadClick}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d1b4e'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3C315B'}
              >
                Chọn file
              </button>
            </>
          )}
        </div>
        
        <span style={{
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center',
          marginTop: '15px',
          maxWidth: '300px',
          lineHeight: '1.4'
        }}>
          Chỉ hỗ trợ file .csv từ Student Grade Extractor
        </span>
      </div>
      
      {/* Upload and navigation buttons */}
      {file && (
        <div style={{
          marginTop: '30px',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            type="button"
            onClick={handleUpload}
            disabled={isLoading}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: isLoading ? '#6b7280' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'Đang upload...' : 'Upload File'}
          </button>

        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Navigation buttons */}
      <div className="group-2" style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '30px',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div 
          className="frame-3" 
          onClick={() => setActiveTab('tutorial')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'tutorial' ? '#3C315B' : '#e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="text-wrapper-4" style={{
            color: activeTab === 'tutorial' ? 'white' : '#374151',
            fontSize: '14px',
            fontWeight: '600'
          }}>Hướng Dẫn</div>
        </div>

        <div 
          className="frame-4" 
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'upload' ? '#3C315B' : '#e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="text-wrapper-4" style={{
            color: activeTab === 'upload' ? 'white' : '#374151',
            fontSize: '14px',
            fontWeight: '600'
          }}>Nhập Điểm</div>
        </div>

        <div 
          className="frame-5" 
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'overview' ? '#3C315B' : '#e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="text-wrapper-4" style={{
            color: activeTab === 'overview' ? 'white' : '#374151',
            fontSize: '14px',
            fontWeight: '600'
          }}>Tổng Quan Bảng Điểm</div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'tutorial' ? renderTutorialContent() : 
       activeTab === 'upload' ? renderUploadContent() : 
       renderOverviewContent()}
    </div>
  );
};
