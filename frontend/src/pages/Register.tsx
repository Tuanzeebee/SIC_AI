import React, { useState } from "react";
import './Register.css';
import logoGoogle from '../assets/logo_gg.png'; 
import Logo from "../assets/LogoPredica.png";
import { authApi } from '../services/api';
import type { RegisterData } from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    name: '', // Will be set to email before sending
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showToast, setShowToast] = useState(false);
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

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError('');
    setShowErrorToast(false); // Hide error toast when user types
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return false;
    }

    if (formData.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Email không hợp lệ');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Set name to email since we're not collecting name separately
      const registrationData = {
        ...formData,
        name: formData.email
      };
      
      const response = await authApi.register(registrationData);
      setSuccess(response.message);
      setShowToast(true);
      
      // Clear form after successful registration
      setFormData({ email: '', name: '', password: '' });
      setConfirmPassword('');
      
      // Hide toast and redirect to login page after 3 seconds
      setTimeout(() => {
        setShowToast(false);
        window.location.href = '/login';
      }, 3000);
      
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
   <div className="register-student">
      {/* Success Toast */}
      {showToast && (
        <div className="toast-notification">
          <div className="toast-content success">
            <div className="toast-icon">✓</div>
            <div className="toast-message">
              <div className="toast-title">Đăng ký thành công!</div>
              <div className="toast-subtitle">Đang chuyển hướng đến trang đăng nhập...</div>
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
              <div className="toast-title">Đăng ký thất bại!</div>
              <div className="toast-subtitle">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="div">
        <div className="overlap">
          <div className="rectangle" />
          <div className="rectangle-2" />
          <div className="rectangle-3" />

          <div className="text-wrapper">
            <img src={Logo} alt="Score Predict Logo" className="logo" />
          </div>

          <div className="text-wrapper-3">Create Your Account</div>

          <p className="welcome-aboard-let-s">
            Welcome aboard! Let&#39;s predict your grades and plan your studies
            effectively with ScorePredict!
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="rectangle-6" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your DTU email"
              className="text-wrapper-12"
              disabled={loading}
              required
            />

            {/* Password Input */}
            <div className="rectangle-7" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="text-wrapper-13"
              disabled={loading}
              required
            />

            {/* Confirm Password Input */}
            <div className="rectangle-5" />
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm password"
              className="text-wrapper-11"
              disabled={loading}
              required
            />

            {/* Error Message */}
            {error && (
              <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="success-message" style={{ color: 'green', marginTop: '10px' }}>
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="text-wrapper-4"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Continue'}
            </button>
          </form>

          <div className="text-wrapper-5">Already have an account?</div>
          <a href="/login" className="text-wrapper-6">Log in</a>

          <p className="p">By signing up, you agree to our</p>
          <div className="text-wrapper-7">Terms of Service</div>
          <div className="text-wrapper-8">and</div>
          <div className="text-wrapper-9">Privacy Policy</div>
          <div className="text-wrapper-10">.</div>
        </div>
      </div>
    </div>
  );
};

export default Register;
