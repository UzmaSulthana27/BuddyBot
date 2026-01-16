import { useState, useRef, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { useChat } from './hooks/useChat';
import Robot3D from './components/auth/Robot3D.jsx';
import LoginForm from './components/auth/LoginForm.jsx';
import SignupForm from './components/auth/SignupForm.jsx';
import Sidebar from './components/chat/SideBar.jsx';
import ChatArea from './components/chat/ChatArea.jsx';
import CreateTeamModal from './components/modals/CreateTeamModal.jsx';
import CreateChannelModal from './components/modals/CreateChannelModal.jsx';
import { Bot, Sparkles, Zap, Users as UsersIcon } from 'lucide-react';
import './App.css';

function App() {
  const { user, login, signup, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [selectedTeamForChannel, setSelectedTeamForChannel] = useState(null);
  const [isAuthAnimating, setIsAuthAnimating] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const robotContainerRef = useRef(null);

  const {
    teams,
    selectedTeam,
    selectedChannel,
    messages,
    aiTyping,
    selectChannel,
    sendMessage,
    createTeam,
    createChannel,
    handleFileUpload
  } = useChat(user);

  useEffect(() => {
    if (user) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleLogin = (credentials) => {
    setIsAuthAnimating(true);
    setTimeout(() => {
      login(credentials);
      setIsAuthAnimating(false);
    }, 600);
  };

  const handleSignup = (userData) => {
    setIsAuthAnimating(true);
    setTimeout(() => {
      signup(userData);
      setIsAuthAnimating(false);
    }, 600);
  };

  const handleLogout = () => {
    logout();
  };

  // App-level: open App modal to create channel (preselect optional team)
  const handleOpenCreateChannel = (team = null) => {
    setSelectedTeamForChannel(team);
    setShowCreateChannel(true);
  };

  /**
   * Centralized channel creation handler.
   * Supports:
   *  - handleCreateChannel(team, channelName, opts)
   *  - handleCreateChannel(channelName)
   */
  const handleCreateChannel = (...args) => {
    if (args.length >= 2) {
      const [maybeTeam, maybeName, opts] = args;

      // If Sidebar explicitly sent origin, treat as final create (do NOT open modal)
      if (opts && opts.origin === 'sidebar') {
        if (maybeTeam && typeof maybeName === 'string') {
          createChannel(maybeTeam, maybeName);
        } else if (typeof maybeTeam === 'string') {
          // fallback: maybeTeam is channelName with no team provided
          const fallbackTeam = selectedTeamForChannel || selectedTeam;
          if (fallbackTeam) createChannel(fallbackTeam, maybeTeam);
        }
        return;
      }

      // No opts: treat (team, channelName) as final create
      if (maybeTeam && typeof maybeName === 'string') {
        createChannel(maybeTeam, maybeName);
        return;
      }
    }

    // If called as (channelName)
    if (args.length === 1 && typeof args[0] === 'string') {
      const channelName = args[0];
      const teamToUse = selectedTeamForChannel || selectedTeam;
      if (teamToUse) {
        createChannel(teamToUse, channelName);
      } else {
        console.warn('No team selected for creating channel:', channelName);
      }
      setShowCreateChannel(false);
      setSelectedTeamForChannel(null);
      return;
    }

    console.warn('handleCreateChannel received unsupported args:', args);
  };

  /**
   * Centralized team creation handler.
   * Supports:
   *  - handleCreateTeam(teamName, opts)
   *  - handleCreateTeam() -> opens App-level modal
   */
  const handleCreateTeam = (teamName, opts) => {
    // If called from Sidebar modal (opts.origin === 'sidebar') treat as final create
    if (opts && opts.origin === 'sidebar') {
      createTeam(teamName);
      return;
    }

    // If name present (no opts) => final create requested by caller
    if (typeof teamName === 'string' && teamName.trim()) {
      createTeam(teamName);
      setShowCreateTeam(false);
      return;
    }

    // Otherwise open the App-level Create Team modal
    setShowCreateTeam(true);
  };

  const switchAuthMode = () => {
    setIsAuthAnimating(true);
    setTimeout(() => {
      setAuthMode(authMode === 'login' ? 'signup' : 'login');
      setIsAuthAnimating(false);
    }, 300);
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-background">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
          <div className="grid-overlay"></div>
        </div>

        <div className={`auth-card ${isAuthAnimating ? 'auth-card-animating' : ''}`}>
          {/* Left side - 3D Robot */}
          <div className="auth-left">
            <div className="auth-left-content">
              <div className="robot-section">
                <div className="robot-container" ref={robotContainerRef}>
                  <Robot3D containerRef={robotContainerRef} />
                </div>
              </div>
              
              <div className="auth-info">
                <h2 className="auth-title">
                  Welcome to ChatTeam
                  <Sparkles className="sparkle-icon" size={32} />
                </h2>
                <p className="auth-subtitle">
                  Real-time collaboration powered by AI
                </p>
                
                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <UsersIcon size={20} />
                    </div>
                    <div className="feature-text">
                      <h4>Team Chat</h4>
                      <p>Collaborate in real-time</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Bot size={20} />
                    </div>
                    <div className="feature-text">
                      <h4>AI Assistant</h4>
                      <p>Get instant answers</p>
                    </div>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Zap size={20} />
                    </div>
                    <div className="feature-text">
                      <h4>Real-time</h4>
                      <p>Lightning-fast sync</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="auth-right">
            <div className="auth-form-wrapper">
              <div className="auth-header">
                <div className="auth-logo">
                  <Bot size={28} className="logo-icon" />
                </div>
                <h1 className="auth-heading">
                  {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
                </h1>
                <p className="auth-description">
                  {authMode === 'login' 
                    ? 'Sign in to continue to your workspace' 
                    : 'Sign up to start collaborating'}
                </p>
              </div>

              <div className={`form-container ${isAuthAnimating ? 'form-fade' : ''}`}>
                {authMode === 'login' ? (
                  <LoginForm 
                    onLogin={handleLogin}
                    onSwitchToSignup={switchAuthMode}
                  />
                ) : (
                  <SignupForm 
                    onSignup={handleSignup}
                    onSwitchToLogin={switchAuthMode}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <div className="welcome-icon">
              <Bot size={48} />
            </div>
            <h2 className="welcome-title">Welcome back, {user.username}! 👋</h2>
            <p className="welcome-subtitle">Loading your workspace...</p>
            <div className="welcome-loader">
              <div className="loader-bar"></div>
            </div>
          </div>
        </div>
      )}

      <div className={`chat-container ${showWelcome ? 'chat-hidden' : 'chat-visible'}`}>
        <Sidebar
          user={user}
          teams={teams}
          selectedChannel={selectedChannel}
          onSelectChannel={selectChannel}
          // onCreateTeam supports both: open modal (no args) OR final create (name, opts)
          onCreateTeam={(maybeName, opts) => {
            if (opts && opts.origin === 'sidebar') {
              handleCreateTeam(maybeName, opts);
              return;
            }
            if (typeof maybeName === 'string') {
              // final create called directly
              handleCreateTeam(maybeName);
            } else {
              // open App-level create team modal
              setShowCreateTeam(true);
            }
          }}
          // onCreateChannel handles both sidebar final create and open modal requests
          onCreateChannel={(teamOrMaybe, maybeName, opts) => {
            if (opts && opts.origin === 'sidebar') {
              if (teamOrMaybe && typeof maybeName === 'string') {
                handleCreateChannel(teamOrMaybe, maybeName, opts);
              } else if (typeof teamOrMaybe === 'string') {
                handleCreateChannel(teamOrMaybe);
              }
              return;
            }

            if (teamOrMaybe && typeof maybeName === 'string') {
              handleCreateChannel(teamOrMaybe, maybeName);
            } else {
              handleOpenCreateChannel(teamOrMaybe);
            }
          }}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <ChatArea
          channel={selectedChannel}
          team={selectedTeam}
          messages={messages}
          onSendMessage={sendMessage}
          onFileUpload={handleFileUpload}
          aiTyping={aiTyping}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {showCreateTeam && (
          <CreateTeamModal
            onClose={() => setShowCreateTeam(false)}
            onCreate={(name) => handleCreateTeam(name)}
          />
        )}

        {showCreateChannel && (
          <CreateChannelModal
            onClose={() => setShowCreateChannel(false)}
            onCreate={(name) => handleCreateChannel(name)}
          />
        )}
      </div>
    </>
  );
}

export default App;
