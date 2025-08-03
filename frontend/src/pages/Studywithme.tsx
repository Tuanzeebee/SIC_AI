import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Studywithme.css";

// Placeholder SVG data URLs for missing icons
const backIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIwIDEySDRsNS01djNIMjB2NGgtMTF2M2w1LTV6Ii8+PC9zdmc+";

const playIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTggNXYxNGwxMS03eiIvPjwvc3ZnPg==";

const pauseIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYgMTloNFY1SDZ2MTR6bTgtMTRoNHYxNGgtNFY1eiIvPjwvc3ZnPg==";

const resetIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDUgNy4yIDkuOGwxLjQgMS40IDIuNC0yLjRWMTVoLTJhNSA1IDAgMSAwIDUgNXY0YTkgOSAwIDEgMS05LTlaIi8+PC9zdmc+";

const settingsIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiM2YjcyODAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTVhMyAzIDAgMSAwIDAtNiAzIDMgMCAwIDAgMCA2eiIvPjxwYXRoIGQ9Ik0xOS40IDEzYy0uMy0uNC0uNi0uOC0xLTEuMWwtLjQtLjN2LS45YzAtLjQtLjEtLjgtLjItMS4xIDAtLjQuMS0uOC4yLTEuMXYtLjlsLjQtLjNjLjQtLjMuNy0uNyAxLTEuMUwxNy42IDVjLS40LS40LS44LS42LTEuMS0xbC0uMy0uNGgtLjljLS40IDAtLjgtLjEtMS4xLS4yLS40IDAtLjguMS0xLjEuMmgtLjlsLS4zLS40Yy0uMy0uNC0uNy0uNy0xLjEtMUw5IDEuNGMtLjQuNC0uNi44LTEgMS4xbC0uNC4zaC0uOWMtLjQgMC0uOC4xLTEuMS4yIDAgLjQtLjEuOC0uMiAxLjFoLS45bC0uMy40Yy0uNC4zLS43LjctMSAxLjFMMS40IDZjLjQuNC42LjggMSAxLjFsLjMuNHYuOWMwIC40LjEuOC4yIDEuMS0uNC4xLS44LjItMS4xLjJ2LjlsLS4zLjRjLS40LjMtLjcuNy0xIDEuMWwxLjYgMS42Yy40LS40LjgtLjYgMS4xLTFsLjMtLjRoLjljLjQgMCAuOC0uMSAxLjEtLjIuNCAwIC44LjEgMS4xLjJoLjlsLjMuNGMuMy40LjcuNyAxLjEgMUw5IDE5YzQuNC0uNC42LS44IDEtMS4xbC40LS4zdi0uOWMwLS40LjEtLjguMi0xLjEgMCAuNC4xLjguMiAxLjF2LjlsLjQuM2MuNC4zLjcuNyAxIDEuMWwxLjYtMS42eiIvPjwvc3ZnPg==";

const nextIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYgNHYxNmwxMi04TDYgNHpNMTggNHYxNmgyVjRoLTJ6Ii8+PC9zdmc+";

const prevIcon = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE4IDR2MTZMMTIgMTJsNi04em0tMTIgMHYxNmgyVjRINnoiLz48L3N2Zz4=";

const Studywithme: React.FC = () => {
  const navigate = useNavigate();
  // Pomodoro timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [sessionCount, setSessionCount] = useState(0);
  
  // Music player state
  const [currentSong, setCurrentSong] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Timer durations in seconds
  const durations = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };

  // Study music playlist with real YouTube embeds
  const playlist = [
    { 
      title: "Lofi Hip Hop Radio - beats to relax/study to", 
      artist: "Lofi Girl", 
      duration: "24/7 Live",
      embedUrl: "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3",
      thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault_live.jpg"
    },
    { 
      title: "Deep Focus Music - Enhanced Concentration", 
      artist: "Greenred Productions", 
      duration: "3:00:00",
      embedUrl: "https://www.youtube.com/embed/SQ93oOmVxHs?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3",
      thumbnail: "https://i.ytimg.com/vi/SQ93oOmVxHs/maxresdefault.jpg"
    },
    { 
      title: "Peaceful Piano & Soft Rain", 
      artist: "Soothing Relaxation", 
      duration: "2:45:12",
      embedUrl: "https://www.youtube.com/embed/1ZYbU82GVz4?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3",
      thumbnail: "https://i.ytimg.com/vi/1ZYbU82GVz4/maxresdefault.jpg"
    },
    { 
      title: "Study Music Alpha Waves", 
      artist: "Study Music Project", 
      duration: "4:22:18",
      embedUrl: "https://www.youtube.com/embed/WPni755-Krg?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3",
      thumbnail: "https://i.ytimg.com/vi/WPni755-Krg/maxresdefault.jpg"
    },
    { 
      title: "Chillhop Essentials - Chill Instrumental Hip Hop", 
      artist: "Chillhop Music", 
      duration: "1:58:44",
      embedUrl: "https://www.youtube.com/embed/5yx6BWlEVcY?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3",
      thumbnail: "https://i.ytimg.com/vi/5yx6BWlEVcY/maxresdefault.jpg"
    },
    { 
      title: "Forest Sounds - Birds Chirping Nature Sounds", 
      artist: "Relaxing Sounds of Nature", 
      duration: "2:30:00",
      embedUrl: "https://www.youtube.com/embed/xNN7iTA57jM?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3",
      thumbnail: "https://i.ytimg.com/vi/xNN7iTA57jM/maxresdefault.jpg"
    }
  ];

  useEffect(() => {
    let interval: number | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsPaused(false);
      // Timer finished - increment session count
      if (mode === 'pomodoro') {
        setSessionCount(prev => prev + 1);
      }
      // Auto switch mode after timer finishes
      if (mode === 'pomodoro') {
        changeMode(sessionCount % 4 === 3 ? 'longBreak' : 'shortBreak');
      } else {
        changeMode('pomodoro');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, sessionCount]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mode change handlers
  const changeMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsActive(false);
    setIsPaused(false);
  };

  // Control handlers
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsActive(false);
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(durations[mode]);
  };

  // Music controls
  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    setCurrentSong((prev) => (prev + 1) % playlist.length);
    // Auto play next song if currently playing
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const prevSong = () => {
    setCurrentSong((prev) => (prev - 1 + playlist.length) % playlist.length);
    // Auto play previous song if currently playing
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <div className="study-with-me-container">
      
      {/* Header with Session Counter and Back Button */}
      <div className="study-header">
        <div className="header-content">
          <div className="header-left">
            <button
              onClick={() => navigate('/course-detail')}
              className="back-button"
            >
              <img src={backIcon} alt="Back" className="back-icon" />
              <span className="back-text">Back</span>
            </button>
            <div className="page-title">
              Study With Me - Focus Session
            </div>
          </div>
          <div className="session-counter">
            <div className="session-label">Sessions Completed</div>
            <div className="session-count">{sessionCount}</div>
          </div>
        </div>
      </div>

      <div className="study-content">
        
        {/* Left Panel - Music Player */}
        <div className="music-panel">
          <div className="music-player-card">
            <h3 className="music-player-title">🎵 Study Playlist</h3>
            
            {/* Current Song Display */}
            <div className="current-song-container">
              {/* YouTube Embed Player */}
              {isPlaying ? (
                <div className="song-thumbnail">
                  <iframe
                    width="100%"
                    height="128"
                    src={playlist[currentSong].embedUrl}
                    title={playlist[currentSong].title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg pointer-events-none"
                    style={{ 
                      border: 'none',
                      outline: 'none'
                    }}
                  ></iframe>
                  {/* Custom overlay to hide YouTube branding completely */}
                  <div 
                    className="absolute inset-0 bg-transparent pointer-events-none"
                    style={{ zIndex: 1 }}
                  ></div>
                </div>
              ) : (
                <div 
                  className="song-thumbnail"
                  style={{ 
                    backgroundImage: playlist[currentSong].thumbnail ? `url(${playlist[currentSong].thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                  onClick={toggleMusic}
                >
                  <div className="song-thumbnail-overlay"></div>
                  <div className="relative text-4xl text-white">🎵</div>
                  <div className="play-button-overlay">
                    <div className="play-button">
                      <img src={playIcon} alt="Play" className="play-icon" />
                    </div>
                  </div>
                </div>
              )}
              <div className="song-info">
                <div className="song-title">{playlist[currentSong].title}</div>
                <div className="song-artist">{playlist[currentSong].artist}</div>
                <div className="song-duration">{playlist[currentSong].duration}</div>
              </div>
            </div>

            {/* Music Controls */}
            <div className="music-controls">
              <button
                onClick={prevSong}
                className="music-control-button"
              >
                <img src={prevIcon} alt="Previous" className="control-icon" />
              </button>
              
              <button
                onClick={toggleMusic}
                className={`music-control-button play ${isPlaying ? 'playing' : ''}`}
              >
                <img 
                  src={isPlaying ? pauseIcon : playIcon} 
                  alt={isPlaying ? "Pause" : "Play"} 
                  className="control-icon-large" 
                />
              </button>
              
              <button
                onClick={nextSong}
                className="music-control-button"
              >
                <img src={nextIcon} alt="Next" className="control-icon" />
              </button>
            </div>

            {/* Open in YouTube button */}
            <div className="youtube-button-container">
              <button
                onClick={() => {
                  // Extract video ID from embed URL
                  const videoId = playlist[currentSong].embedUrl.match(/embed\/([^?]+)/)?.[1];
                  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
                  window.open(youtubeUrl, '_blank');
                }}
                className="youtube-button"
              >
                📱 Open in YouTube
              </button>
            </div>

            {/* Playlist */}
            <div className="playlist-container">
              {playlist.map((song, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentSong(index);
                    if (isPlaying) {
                      setIsPlaying(false);
                      setTimeout(() => setIsPlaying(true), 100);
                    }
                  }}
                  className={`playlist-item ${index === currentSong ? 'active' : ''}`}
                >
                  <div 
                    className="playlist-thumbnail"
                    style={{ 
                      backgroundImage: song.thumbnail ? `url(${song.thumbnail})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  ></div>
                  <div className="playlist-info">
                    <div className="playlist-title">{song.title}</div>
                    <div className="playlist-artist">{song.artist}</div>
                  </div>
                  {index === currentSong && isPlaying && (
                    <div className="playing-indicator">🎵</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Timer */}
        <div className="timer-panel">
          
          {/* Mode Selection */}
          <div className="mode-selection">
            <button
              onClick={() => changeMode('pomodoro')}
              className={`mode-button ${mode === 'pomodoro' ? 'active' : ''}`}
            >
              🍅 Pomodoro (25m)
            </button>
            <button
              onClick={() => changeMode('shortBreak')}
              className={`mode-button ${mode === 'shortBreak' ? 'active' : ''}`}
            >
              ☕ Short Break (5m)
            </button>
            <button
              onClick={() => changeMode('longBreak')}
              className={`mode-button ${mode === 'longBreak' ? 'active' : ''}`}
            >
              🛋️ Long Break (15m)
            </button>
          </div>

          {/* Timer Circle */}
          <div className={`timer-circle-container ${isActive ? 'active' : ''}`}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            
            {/* Timer Display */}
            <div className="timer-display">
              <div className="timer-time">
                {formatTime(timeLeft)}
              </div>
              <div className="timer-mode-label">
                {mode === 'pomodoro' ? '🎯 Focus Time' : 
                 mode === 'shortBreak' ? '☕ Short Break' : '🛋️ Long Break'}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="control-buttons">
            {!isActive && !isPaused ? (
              <button
                onClick={startTimer}
                className="control-button start-button"
              >
                ▶️ Start
              </button>
            ) : isActive ? (
              <button
                onClick={pauseTimer}
                className="control-button pause-button"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={startTimer}
                className="control-button start-button"
              >
                ▶️ Resume
              </button>
            )}
            
            <button
              onClick={resetTimer}
              className="control-button reset-button"
            >
              <img src={resetIcon} alt="Reset" className="reset-icon" />
            </button>
          </div>
        </div>

        {/* Right Panel - Stats & Settings */}
        <div className="stats-panel">
          <div className="stats-card">
            <h3 className="stats-title">📊 Today's Stats</h3>
            
            <div className="stats-items">
              <div className="stat-item">
                <span>Pomodoros:</span>
                <span className="stat-value">{sessionCount}</span>
              </div>
              <div className="stat-item">
                <span>Focus Time:</span>
                <span className="stat-value">{Math.floor(sessionCount * 25)} min</span>
              </div>
              <div className="stat-item">
                <span>Current Streak:</span>
                <span className="stat-value">{sessionCount > 0 ? '🔥 ' + sessionCount : '0'}</span>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-label">Progress</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${Math.min((sessionCount / 8) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="progress-text">{sessionCount}/8 daily goal</div>
            </div>
          </div>

          <div className="stats-card">
            <h3 className="stats-title">⚙️ Quick Settings</h3>
            
            <div className="settings-buttons">
              <button className="settings-button">
                🔊 Volume Control
              </button>
              <button className="settings-button">
                🌙 Dark Mode
              </button>
              <button className="settings-button">
                📈 View Analytics
              </button>
              <button className="settings-button">
                <img src={settingsIcon} alt="Settings" className="settings-icon" />
                More Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studywithme;
