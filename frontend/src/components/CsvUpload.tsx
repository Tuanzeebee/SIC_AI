import React, { useState } from 'react';
import { scoreRecordApi } from '../services/api';
import type { UploadResponse } from '../services/api';
import './CsvUpload.css';

const CsvUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [userId, setUserId] = useState<number>(1); // Default user ID

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Vui lòng chọn file CSV');
      return;
    }

    setUploading(true);
    try {
      const response = await scoreRecordApi.uploadCsv(userId, file);
      setResult(response);
    } catch (error) {
      console.error('Error uploading file:', error);
      setResult({
        success: false,
        message: 'Lỗi khi upload file',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    const fileInput = document.getElementById('csvFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="csv-upload-container">
      <div className="csv-upload-card">
        <h2>Upload CSV File</h2>
        <p className="description">
          Upload file CSV để tạo dữ liệu cho 3 bảng: ScoreRecord, PredictionInputReverse, và PredictionInputScore. 
          Hỗ trợ tài chính và tinh thần sẽ được lấy từ kết quả khảo sát gần nhất của người dùng.
        </p>

        <div className="form-group">
          <label htmlFor="userId">User ID:</label>
          <input
            type="number"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(Number(e.target.value))}
            min="1"
            className="user-id-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="csvFile">Chọn file CSV:</label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>

        {file && (
          <div className="file-info">
            <p><strong>File đã chọn:</strong> {file.name}</p>
            <p><strong>Kích thước:</strong> {(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        <div className="button-group">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="upload-btn"
          >
            {uploading ? 'Đang upload...' : 'Upload CSV'}
          </button>
          
          <button
            onClick={resetForm}
            className="reset-btn"
          >
            Reset
          </button>
        </div>

        {result && (
          <div className={`result ${result.success ? 'success' : 'error'}`}>
            <h3>{result.success ? '✅ Thành công!' : '❌ Lỗi!'}</h3>
            <p>{result.message}</p>
            
            {result.success && result.data && (
              <div className="success-details">
                <h4>Chi tiết kết quả:</h4>
                <ul>
                  <li><strong>ScoreRecord:</strong> {result.data.created.scoreRecords} bản ghi</li>
                  <li><strong>PredictionInputReverse:</strong> {result.data.created.predictionInputsReverse} bản ghi</li>
                  <li><strong>PredictionInputScore:</strong> {result.data.created.predictionInputsScore} bản ghi</li>
                  <li><strong>Tổng dữ liệu CSV:</strong> {result.data.total} dòng</li>
                </ul>
                
                {result.data.sample && result.data.sample.length > 0 && (
                  <div className="sample-data">
                    <h4>Dữ liệu mẫu (ScoreRecord):</h4>
                    <div className="sample-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Year</th>
                            <th>Semester</th>
                            <th>Course Code</th>
                            <th>Raw Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.data.sample.slice(0, 3).map((record, index) => (
                            <tr key={index}>
                              <td>{record.studentId}</td>
                              <td>{record.year}</td>
                              <td>{record.semesterNumber}</td>
                              <td>{record.courseCode}</td>
                              <td>{record.rawScore}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!result.success && result.error && (
              <div className="error-details">
                <p><strong>Chi tiết lỗi:</strong> {result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="csv-format-info">
          <h4>Định dạng CSV yêu cầu:</h4>
          <p>File CSV cần có các cột sau (có thể sử dụng tên tiếng Anh hoặc tiếng Việt):</p>
          <ul>
            <li><strong>student_id</strong> - Mã sinh viên</li>
            <li><strong>year</strong> - Năm học</li>
            <li><strong>semester_number</strong> - Học kỳ</li>
            <li><strong>course_code</strong> - Mã môn học</li>
            <li><strong>course_name</strong> - Tên môn học</li>
            <li><strong>study_format</strong> - Hình thức học (Online/Offline)</li>
            <li><strong>credits_unit</strong> - Số tín chỉ</li>
            <li><strong>raw_score</strong> - Điểm số</li>
            <li><strong>part_time_hours</strong> - Giờ làm thêm</li>
            <li><strong>weekly_study_hours</strong> - Giờ học/tuần</li>
            <li><strong>attendance_percentage</strong> - Tỷ lệ tham dự (%)</li>
          </ul>
          <p><strong>Lưu ý:</strong> Hỗ trợ tài chính và tinh thần sẽ được lấy từ kết quả khảo sát gần nhất của bạn.</p>
        </div>
      </div>
    </div>
  );
};

export default CsvUpload;
