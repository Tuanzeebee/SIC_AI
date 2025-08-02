import React, { useState, useEffect } from "react";
import Logo from "../assets/LogoPredica.png";
import { Outlet } from "react-router-dom";
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    window.location.href = '/';
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  return (
    <div className="login-container">
      {/* Navbar */}
      <header className="header">
        <div className="nav-left">
          <img src={Logo} alt="Score Predict Logo" className="logo" />
          <div className="nav-links">
            {/* <a href="#features">Our Features</a> */}
          </div>
        </div>
        <div className="nav-right">
          {user ? (
            <div className="user-menu">
              <div className="user-info" onClick={toggleUserMenu}>
                <span className="user-email">{user.email}</span>
                <span className="dropdown-arrow">▼</span>
              </div>
              {showUserMenu && (
                <div className="user-dropdown">
                  <button className="logout-btn" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="login-btn-nav" onClick={() => window.location.href="/login"}>Đăng nhập</button>
              <button className="signup-btn" onClick={() => window.location.href="/register"}>Đăng kí</button>
            </>
          )}
        </div>  
      </header>

      {/* Nội dung trang */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>SCORE<br/>PREDICT</h3>
            <p>
              Empowering students with AI-driven grade predictions and academic insights for better educational outcomes.
            </p>
            <div className="social-icons">
              <a href="#twitter"><i className="fab fa-twitter"></i></a>
              <a href="#facebook"><i className="fab fa-facebook"></i></a>
              <a href="#linkedin"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li>Features</li>
              <li>Pricing</li>
              <li>API</li>
              <li>Integrations</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Careers</li>
              <li>Blog</li>
              <li>Press</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 ScorePredict. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;