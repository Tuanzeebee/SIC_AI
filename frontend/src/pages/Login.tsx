import React, { useState } from "react";
import './Login.css';
import logoGoogle from '../assets/logo_gg.png'; 
import Logo from "../assets/LogoPredica.png";
import { authApi } from '../services/api';
import type { LoginData } from '../services/api';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
    setShowErrorToast(false); // Hide error toast when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(formData);
      
      // Save user info to localStorage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Show success toast
      setShowSuccessToast(true);
      
      // Hide toast and redirect to home page after 2 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
        // Check if there's a redirect URL or go to home
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
        window.location.href = redirectUrl;
      }, 2000);
      
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box-pa">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="toast-notification">
          <div className="toast-content success">
            <div className="toast-icon">✓</div>
            <div className="toast-message">
              <div className="toast-title">Đăng nhập thành công!</div>
              <div className="toast-subtitle">Đang chuyển hướng đến trang chủ...</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className="toast-notification">
          <div className="toast-content error">
            <div className="toast-icon">✕</div>
            <div className="toast-message">
              <div className="toast-title">Đăng nhập thất bại!</div>
              <div className="toast-subtitle">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="login-box">
        <img src={Logo} alt="Score Predict Logo" className="logo" />
        <h3>ĐĂNG NHẬP</h3>
        <p className="welcome-text">Chào mừng trở lại! Hãy trở lại trang Web nào</p>
        
        <button className="google-btn">
          <img src={logoGoogle} alt="Google logo" className="google-icon" />
          Đăng nhập bằng Google
        </button>
        
        <div className="or-divider">Hoặc bằng email</div>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Nhập email" 
            className="input-field"
            disabled={loading}
            required
          />
          <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Nhập mật khẩu" 
            className="input-field"
            disabled={loading}
            required
          />
          
          {/* Error Message */}
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="register-link">
          Bạn không có tài khoản? <a href="/register">Đăng kí</a>
        </div>
        <div className="forgot-password">
          <a href="#forgot">Quên mật khẩu?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
