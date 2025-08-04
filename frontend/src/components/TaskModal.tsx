import React, { useState, useEffect } from 'react';
import './TaskModal.css';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskTitle: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskId, taskTitle }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'transcript' | 'downloads'>('notes');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [progress, setProgress] = useState(30); // 30% progress example
  const [currentTime, setCurrentTime] = useState('9:41');
  const [sessionTime, setSessionTime] = useState('99:00');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePlayPause = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const notes = [
    { time: '9:41', content: 'Hôy cùng tôi khám phá những cách mà AI có thể nâng cao sự nghiệp và cuộc sống của bạn.' },
    { time: '9:41', content: 'Hôy cùng tôi khám phá những cách mà AI có thể nâng cao sự nghiệp và cuộc sống của bạn.' }
  ];

  const comments = [
    { user: 'Piyush', avatar: '👤', message: 'Enjoying the stream so far', color: '#ff6b6b' },
    { user: 'Jagjit', avatar: '👤', message: 'Look at that!', color: '#4ecdc4' },
    { user: 'Pradeep', avatar: '👤', message: 'You are so good in this game', color: '#45b7d1' }
  ];

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="task-modal-header">
          <div className="session-timer">
            <span className="session-label">Session</span>
            <div className="timer-controls">
              <button className="timer-btn">⏸️</button>
              <span className="timer-display">{sessionTime}</span>
              <button className="timer-btn">▶️</button>
            </div>
          </div>
          <div className="header-actions">
            <span className="esc-hint">ESC để đóng</span>
            <button className="minimize-button" title="Thu nhỏ">−</button>
            <button className="close-button" onClick={onClose} title="Đóng module">✕</button>
          </div>
        </div>

        {/* Module Title */}
        <h1 className="module-title">Module 1</h1>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{progress}%</span>
          <div className="progress-icons">
            <span className="progress-icon">🏆</span>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Huy hiệu đã đạt:</span>
          <span className="breadcrumb-link">Người mới bắt đầu</span>
          <span>🏅</span>
          <span className="breadcrumb-link">Học già phở</span>
        </div>

        <div className="task-modal-content">
          {/* Video Section */}
          <div className="video-section">
            <div className="video-container">
              <div className="video-placeholder" onClick={handlePlayPause}>
                {/* Decorative video content */}
                <div className="video-scene">
                  <div className="desk-area">
                    <div className="desk"></div>
                    <div className="chair"></div>
                    <div className="books"></div>
                    <div className="lamp"></div>
                    <div className="plant"></div>
                  </div>
                </div>
                
                {!isVideoPlaying && (
                  <div className="play-overlay">
                    <button className="play-button-large">▶️</button>
                  </div>
                )}
              </div>
              
              {/* Video Controls */}
              <div className="video-controls">
                <button className="control-btn" onClick={handlePlayPause}>
                  {isVideoPlaying ? '⏸️' : '▶️'}
                </button>
                <button className="control-btn">⏮️</button>
                <div className="video-progress">
                  <div className="video-progress-bar">
                    <div className="video-progress-fill" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <span className="video-time">2m / 7m</span>
                <button className="control-btn">🔊</button>
                <button className="control-btn">⚙️</button>
                <button className="control-btn">⛶</button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
              <h3>Comments</h3>
              <div className="comments-list">
                {comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div className="comment-avatar" style={{ backgroundColor: comment.color }}>
                      {comment.avatar}
                    </div>
                    <div className="comment-content">
                      <span className="comment-user">{comment.user}</span>
                      <span className="comment-message">{comment.message}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="comment-input">
                <input type="text" placeholder="Say something..." />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar-section">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                Notes
              </button>
              <button 
                className={`tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
                onClick={() => setActiveTab('transcript')}
              >
                Transcript
              </button>
              <button 
                className={`tab-btn ${activeTab === 'downloads' ? 'active' : ''}`}
                onClick={() => setActiveTab('downloads')}
              >
                Downloads
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'notes' && (
                <div className="notes-content">
                  {notes.map((note, index) => (
                    <div key={index} className="note-item">
                      <span className="note-time">{note.time}</span>
                      <span className="note-text">{note.content}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'transcript' && (
                <div className="transcript-content">
                  <p>Transcript content will be displayed here...</p>
                </div>
              )}
              
              {activeTab === 'downloads' && (
                <div className="downloads-content">
                  <p>Download materials will be listed here...</p>
                </div>
              )}
            </div>

            {/* Next Button */}
            <div className="next-section">
              <button className="close-module-button" onClick={onClose}>
                🚪 Đóng Module
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
