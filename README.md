# ChatTeam 🤖

A modern, real-time team collaboration platform with AI-powered assistance. Built with React, Node.js, and WebSocket technology for seamless communication and intelligent help.

![ChatTeam Logo](https://img.shields.io/badge/ChatTeam-Real--Time-blue?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat&logo=mysql)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?style=flat&logo=socket.io)

## ✨ Features

### 🚀 Core Functionality
- **Real-time Messaging**: Instant communication with WebSocket connections
- **Team & Channel Management**: Create and organize teams with multiple channels
- **User Authentication**: Secure JWT-based login and signup system
- **File Sharing**: Share files and documents within channels
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🤖 AI-Powered Assistance
- **Intelligent Chatbot**: AI assistant available in the `ai-help` channel
- **@AI Mentions**: Trigger AI responses by mentioning `@ai` in any message
- **Programming Help**: Get instant answers about React, JavaScript, Python, HTML, CSS, Node.js, databases, APIs, and more
- **Hugging Face Integration**: Powered by Microsoft's DialoGPT model with fallback responses

### 🎨 User Experience
- **3D Robot Animation**: Interactive Three.js robot on the login screen
- **Modern UI**: Clean, animated interface with smooth transitions
- **Typing Indicators**: See when team members are typing
- **Welcome Animations**: Smooth onboarding experience

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Three.js** - 3D graphics for robot animation
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client for API calls
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MySQL2** - Database connectivity
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### AI Integration
- **Hugging Face API** - AI model inference
- **DialoGPT-medium** - Conversational AI model

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+ database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/UzmaSulthana27/BuddyBot.git
   cd BuddyBot/chatteam
   ```

2. **Install dependencies**

   **Frontend:**
   ```bash
   npm install
   ```

   **Backend:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Database Setup**

   Create a MySQL database and run the following SQL to create tables:

   ```sql
   CREATE DATABASE chatteam_db;

   USE chatteam_db;

   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(50) UNIQUE NOT NULL,
     email VARCHAR(100) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE teams (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     created_by INT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (created_by) REFERENCES users(id)
   );

   CREATE TABLE channels (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(50) NOT NULL,
     team_id INT,
     created_by INT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (team_id) REFERENCES teams(id),
     FOREIGN KEY (created_by) REFERENCES users(id)
   );

   CREATE TABLE messages (
     id INT AUTO_INCREMENT PRIMARY KEY,
     channel_id INT,
     user_id INT NULL,
     content TEXT NOT NULL,
     is_ai BOOLEAN DEFAULT FALSE,
     is_file BOOLEAN DEFAULT FALSE,
     file_url VARCHAR(500) NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (channel_id) REFERENCES channels(id),
     FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

4. **Environment Configuration**

   Create a `.env` file in the `backend` directory:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=chatteam_db

   # JWT Secret (use a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_here

   # Server Configuration
   PORT=5000
   FRONTEND_URL=http://localhost:3000

   # AI Configuration (optional - fallback responses will be used if not provided)
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```

5. **Start the Application**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm start
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Access the Application**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Getting Started
1. **Sign Up**: Create a new account with username, email, and password
2. **Login**: Use your credentials to access the platform
3. **Create Team**: Start by creating your first team
4. **Add Channels**: Create channels within teams for organized communication

### Using AI Assistant
- **AI-Help Channel**: Messages in the `ai-help` channel automatically trigger AI responses
- **@AI Mentions**: Type `@ai` followed by your question in any channel
- **Topics Covered**: Programming, web development, databases, APIs, Git, and more

### Real-time Features
- **Instant Messaging**: Messages appear instantly for all team members
- **Typing Indicators**: See when others are typing
- **File Sharing**: Drag and drop files to share with your team

## 🏗️ Project Structure

```
chatteam/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── chat/          # Chat interface components
│   │   └── modals/        # Modal dialogs
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and utility services
│   └── assets/            # Images and media
├── backend/
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── service/           # Business logic services
│   └── socket/            # WebSocket handlers
├── package.json           # Frontend dependencies
└── README.md             # This file
```

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon






---

**Happy collaborating! 🚀**
