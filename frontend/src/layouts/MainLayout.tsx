import React, { useState, useEffect } from "react";
import Logo from "../assets/LogoPredica.png";
import { Outlet } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ToastContainer";
import { ToastProvider } from "../contexts/ToastContext";
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false);
  const [dropdownTimer, setDropdownTimer] = useState<number | null>(null);
  
  // Toast hook for layout-wide toasts
  const { toasts, showSuccess, showError, showInfo, showWarning, removeToast } = useToast();

  const toastMethods = {
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

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
      if (!target.closest('.feature-dropdown-container')) {
        setShowFeatureDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimer) {
        clearTimeout(dropdownTimer);
      }
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

  const handleFeatureMouseEnter = () => {
    if (dropdownTimer) {
      clearTimeout(dropdownTimer);
      setDropdownTimer(null);
    }
    setShowFeatureDropdown(true);
  };

  const handleFeatureMouseLeave = () => {
    const timer = window.setTimeout(() => {
      setShowFeatureDropdown(false);
    }, 300); // 300ms delay
    setDropdownTimer(timer);
  };
  return (
    <ToastProvider toastMethods={toastMethods}>
      <div className="login-container">
      {/* Navbar */}
      <header className="header">
        <div className="nav-left">
          <img src={Logo} alt="Score Predict Logo" onClick={() => window.location.href="/"} className="logo" />
          <div className="nav-links">
            <div 
              className="feature-dropdown-container"
              onMouseEnter={handleFeatureMouseEnter}
              onMouseLeave={handleFeatureMouseLeave}
            >
              <a href="/" className="feature-link">
                Our Features
                <span className="dropdown-arrow">▼</span>
              </a>
              {showFeatureDropdown && (
                <div className="feature-dropdown">
                  <div className="feature-grid">
                    <div className="feature-item" onClick={() => window.location.href = '/tutorial'}>
                      <div className="feature-icon">📝</div>
                      <div className="feature-content">
                        <h4>Grade Prediction</h4>
                        <p>Predict your academic performance using AI</p>
                      </div>
                    </div>
                    <div className="feature-item" onClick={() => window.location.href = '/course-detail'}>
                      <div className="feature-icon">📊</div>
                      <div className="feature-content">
                        <h4>Course Details</h4>
                        <p>Analyze your study patterns and habits</p>
                      </div>
                    </div>
                    <div className="feature-item" onClick={() => window.location.href = '/study-with-me'}>
                      <div className="feature-icon">🎯</div>
                      <div className="feature-content">
                        <h4>Study With Me</h4>
                        <p>Set and track your academic goals</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">📈</div>
                      <div className="feature-content">
                        <h4>Progress Tracking</h4>
                        <p>Monitor your academic progress over time</p>
                      </div>
                    </div>
                    <div className="feature-item">
                      <div className="feature-icon">🤖</div>
                      <div className="feature-content">
                        <h4>AI Insights</h4>
                        <p>Get personalized recommendations</p>
                      </div>
                    </div>
                    <div className="feature-item" onClick={() => window.location.href = '/survey'}>
                      <div className="feature-icon">📋</div>
                      <div className="feature-content">
                        <h4>Survey System</h4>
                        <p>Complete surveys for better predictions</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

      {/* Toast Container for MainLayout pages */}
      <ToastContainer toasts={toasts} removeToast={removeToast} hasLayout={true} />
      </div>
    </ToastProvider>
  );
};

export default MainLayout;