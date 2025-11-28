// import { useState, useRef } from 'react';
// import { useAuth } from './context/AuthContext';
// import { useChat } from './hooks/useChat';
// import Robot3D from './components/auth/Robot3D';
// import LoginForm from './components/auth/LoginForm';
// import Sidebar from './components/chat/SideBar';
// import ChatArea from './components/Chat/ChatArea';
// import CreateTeamModal from './components/Modals/CreateTeamModal';
// import CreateChannelModal from './components/Modals/CreateChannelModal';
// import { Bot } from 'lucide-react';
// import './App.css';

// function App() {
//   const { user, login, signup, logout } = useAuth();
//   const [authMode, setAuthMode] = useState('login');
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [showCreateTeam, setShowCreateTeam] = useState(false);
//   const [showCreateChannel, setShowCreateChannel] = useState(false);
//   const [selectedTeamForChannel, setSelectedTeamForChannel] = useState(null);
//   const robotContainerRef = useRef(null);

//   const {
//     teams,
//     selectedTeam,
//     selectedChannel,
//     messages,
//     aiTyping,
//     selectChannel,
//     sendMessage,
//     createTeam,
//     createChannel,
//     handleFileUpload
//   } = useChat(user);

//   // Auth handlers
//   const handleLogin = (credentials) => {
//     login(credentials);
//   };

//   const handleSignup = (userData) => {
//     signup(userData);
//   };

//   const handleLogout = () => {
//     logout();
//   };

//   // Modal handlers
//   const handleOpenCreateChannel = (team) => {
//     setSelectedTeamForChannel(team);
//     setShowCreateChannel(true);
//   };

//   const handleCreateTeam = (teamName) => {
//     createTeam(teamName);
//     setShowCreateTeam(false);
//   };

//   const handleCreateChannel = (channelName) => {
//     if (selectedTeamForChannel) {
//       createChannel(selectedTeamForChannel, channelName);
//       setShowCreateChannel(false);
//     }
//   };

//   // Render auth screen
//   if (!user) {
//     return (
//       <div className="auth-container">
//         <div className="auth-background">
//           <div className="blob blob-1"></div>
//           <div className="blob blob-2"></div>
//         </div>

//         <div className="auth-card">
//           {/* Left side - 3D Robot */}
//           <div className="auth-left">
//             <div className="robot-container" ref={robotContainerRef}>
//               <Robot3D containerRef={robotContainerRef} />
//             </div>
//             <h2 className="auth-title">Welcome to ChatTeam</h2>
//             <p className="auth-subtitle">Real-time collaboration powered by AI</p>
            
//             <div className="feature-list">
//               <div className="feature-item">
//                 <div className="feature-icon">👥</div>
//                 <p>Team Chat</p>
//               </div>
//               <div className="feature-item">
//                 <div className="feature-icon">🤖</div>
//                 <p>AI Assistant</p>
//               </div>
//               <div className="feature-item">
//                 <div className="feature-icon">⚡</div>
//                 <p>Real-time</p>
//               </div>
//             </div>
//           </div>

//           {/* Right side - Auth Form */}
//           <div className="auth-right">
//             <div className="auth-form-container">
//               <div className="auth-header">
//                 <div className="auth-logo">
//                   <Bot size={32} />
//                 </div>
//                 <h1>{authMode === 'login' ? 'Welcome Back!' : 'Create Account'}</h1>
//                 <p>
//                   {authMode === 'login' 
//                     ? 'Sign in to continue to your workspace' 
//                     : 'Sign up to start collaborating'}
//                 </p>
//               </div>

//               {authMode === 'login' ? (
//                 <LoginForm 
//                   onLogin={handleLogin}
//                   onSwitchToSignup={() => setAuthMode('signup')}
//                 />
//               ) : (
//                 <SignupForm 
//                   onSignup={handleSignup}
//                   onSwitchToLogin={() => setAuthMode('login')}
//                 />
//               )}

//               <p className="demo-notice">Demo app - use any credentials</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render chat interface
//   return (
//     <div className="chat-container">
//       <Sidebar
//         user={user}
//         teams={teams}
//         selectedChannel={selectedChannel}
//         onSelectChannel={selectChannel}
//         onCreateTeam={() => setShowCreateTeam(true)}
//         onCreateChannel={handleOpenCreateChannel}
//         onLogout={handleLogout}
//         isOpen={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//       />

//       <ChatArea
//         channel={selectedChannel}
//         team={selectedTeam}
//         messages={messages}
//         onSendMessage={sendMessage}
//         onFileUpload={handleFileUpload}
//         aiTyping={aiTyping}
//         onOpenSidebar={() => setSidebarOpen(true)}
//       />

//       {showCreateTeam && (
//         <CreateTeamModal
//           onClose={() => setShowCreateTeam(false)}
//           onCreate={handleCreateTeam}
//         />
//       )}

//       {showCreateChannel && (
//         <CreateChannelModal
//           onClose={() => setShowCreateChannel(false)}
//           onCreate={handleCreateChannel}
//         />
//       )}
//     </div>
//   );
// }

// export default App;