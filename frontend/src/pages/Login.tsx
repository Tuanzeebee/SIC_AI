import React from "react";
import './Login.css';
import logoGoogle from '../assets/logo_gg.png'; 
import Logo from "../assets/LogoPredica.png";

const Login: React.FC = () => {
  return (
    <div className="login-box-pa">
      <div className="login-box">
        <img src={Logo} alt="Score Predict Logo" className="logo" />
        <h3>ĐĂNG NHẬP</h3>
        <p className="welcome-text">Chào mừng trở lại! Hãy trở lại trang Web nào</p>
        <button className="google-btn">
          <img src={logoGoogle} alt="Google logo" className="google-icon" />
          Đằng nhập bằng Google
        </button>
        <div className="or-divider">Hoặc bằng email</div>
        <form>
          <input type="email" placeholder="Nhập email" className="input-field" />
          <input type="password" placeholder="Nhập mật khẩu" className="input-field" />
          <button type="submit" className="login-btn">Đăng nhập</button>
        </form>
        <div className="register-link">
          Bạn không có tài khoản? <a href="#register">Đăng kí</a>
        </div>
        <div className="forgot-password">
          <a href="#forgot">Quên mật khẩu?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
