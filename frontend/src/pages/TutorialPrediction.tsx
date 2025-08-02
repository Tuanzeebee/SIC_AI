import React, { useState } from "react";
import { scoreRecordApi } from "../services/api";
import "./TutorialPrediction.css";

// Import placeholder images - you may need to replace these with actual image paths
const frame = "https://via.placeholder.com/36x36?text=📊";
const vector = "https://via.placeholder.com/21x26?text=✅";
const image = "https://via.placeholder.com/19x18?text=⭐";

export const Tutorial = (): React.JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>('tutorial');
  const [viewMode, setViewMode] = useState<string>('semester'); // 'semester' for Theo Kỳ, 'full' for Full
  const [partTimeHours, setPartTimeHours] = useState<number>(0);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setMessage("");
      } else {
        setMessage('Chỉ hỗ trợ file CSV ');
      }
    }
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
    fileInput?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Vui lòng chọn file CSV');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setMessage('Vui lòng đăng nhập để tải lên file');
      return;
    }

    setIsLoading(true);
    setMessage("");
    
    try {
      const result = await scoreRecordApi.uploadCsv(userId, file);
      
      if (result.success) {
        setMessage('Upload file thành công!');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('csv-file-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setMessage(result.message || 'Lỗi khi tải lên file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Lỗi khi tải lên file. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
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
    return (
      <div className="frame">
        <div className="frame-wrapper">
          <div className="div">
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
        </div>

        <div className="div-4">
          <div className="overlap-group-wrapper">
            <div className="overlap-group">
              <div className="rectangle" />

              <div className="div-5">
                <div className="div-6">
                  <img className="img" alt="Frame" src={frame} />

                  <div className="div-7">
                    <div className="div-8">
                      <div className="text-wrapper-5">📊</div>
                      <div className="text-wrapper-6">Tổng tín chỉ</div>
                    </div>
                    <div className="text-wrapper-7">120</div>
                  </div>
                </div>

                <div className="div-wrapper">
                  <div className="div-9">
                    <div className="text-wrapper-8">🎯</div>
                    <div className="text-wrapper-9">Chương trình đào tạo</div>
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
                      <img className="vector" alt="Vector" src={vector} />
                    </div>
                  </div>

                  <div className="div-7">
                    <div className="div-11">
                      <div className="text-wrapper-10">✅</div>
                      <div className="text-wrapper-11">Tín chỉ đã học</div>
                    </div>
                    <div className="text-wrapper-12">85</div>
                  </div>
                </div>

                <div className="frame-wrapper-3">
                  <div className="div-12">
                    <div className="text-wrapper-13">📈</div>
                    <div className="text-wrapper-14">Tiến độ: 70.8%</div>
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
                      <img className="vector-2" alt="Vector" src={image} />
                    </div>
                  </div>

                  <div className="div-7">
                    <div className="div-14">
                      <div className="text-wrapper-15">⭐</div>
                      <div className="text-wrapper-16">GPA hiện tại</div>
                    </div>
                    <div className="text-wrapper-17">3.01</div>
                  </div>
                </div>

                <div className="frame-wrapper-5">
                  <div className="div-15">
                    <div className="text-wrapper-18">🏆</div>
                    <div className="text-wrapper-19">Xếp loại: Khá</div>
                  </div>
                </div>
              </div>

              <div className="rectangle-2" />
            </div>
          </div>
        </div>

        {/* Additional Information Section - Moved to bottom */}
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
            <label style={{
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Thời gian đi làm (giờ/tuần)
            </label>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                min="0"
                max="60"
                value={partTimeHours}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= 60) {
                    setPartTimeHours(value);
                  }
                }}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  width: '80px',
                  textAlign: 'center'
                }}
                placeholder="0"
              />
              <span style={{ color: '#6b7280', fontSize: '14px' }}>giờ/tuần</span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>(0-60 giờ)</span>
            </div>
          </div>
        </div>
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
      
      {/* Message display */}
      {message && (
        <div style={{
          padding: '12px 20px',
          margin: '0 0 20px 0',
          borderRadius: '8px',
          backgroundColor: message.includes('thành công') ? '#d1fae5' : '#fee2e2',
          color: message.includes('thành công') ? '#065f46' : '#dc2626',
          border: `1px solid ${message.includes('thành công') ? '#a7f3d0' : '#fca5a5'}`,
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          {message}
        </div>
      )}
      
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
