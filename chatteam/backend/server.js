const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');
const authRoutes = require('./routes/routes');
const teamsRoutes = require('./routes/teams');
const messagesRoutes = require('./routes/messages');
const setupSocketHandlers = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DEBUG ROUTE (temporary, remove after troubleshooting) ---
// app.post('/api/_debug/save-message', async (req, res) => {
//   try {
//     const { channelId, userId, content } = req.body;
//     if (!channelId || !userId || !content) {
//       return res.status(400).json({ ok: false, error: 'channelId, userId and content are required' });
//     }

//     // require the module that exports saveMessage
//     const messagesModule = require('./routes/messages');
//     // saveMessage should be exported as property on module (see notes)
//     const saveMessage = messagesModule.saveMessage || messagesModule.save_message || messagesModule.default?.saveMessage;
//     if (typeof saveMessage !== 'function') {
//       console.error('saveMessage not found on routes/messages:', Object.keys(messagesModule));
//       return res.status(500).json({ ok: false, error: 'saveMessage function not available on routes/messages' });
//     }

//     const msg = await saveMessage(channelId, userId, content, false, false, null);
//     return res.json({ ok: true, msg });
//   } catch (err) {
//     console.error('Debug save-message error:', err);
//     return res.status(500).json({ ok: false, error: err.message });
//   }
// });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/messages', messagesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Setup Socket.io
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});



// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});