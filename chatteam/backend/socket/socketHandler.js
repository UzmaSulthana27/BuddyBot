   const jwt = require('jsonwebtoken');
const { saveMessage } = require('../routes/messages');

function setupSocketHandlers(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

    // Join channel room
    socket.on('join_channel', (channelId) => {
      socket.join(`channel_${channelId}`);
      console.log(`User ${socket.user.username} joined channel ${channelId}`);
    });

    // Leave channel room
    socket.on('leave_channel', (channelId) => {
      socket.leave(`channel_${channelId}`);
      console.log(`User ${socket.user.username} left channel ${channelId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { channelId, content, isAi, isFile, fileUrl } = data;

        // Save to database
        const message = await saveMessage(
          channelId,
          isAi ? null : socket.user.id,
          content,
          isAi,
          isFile,
          fileUrl
        );

        // Broadcast to channel
        io.to(`channel_${channelId}`).emit('new_message', {
          ...message,
          username: isAi ? 'AI Assistant' : socket.user.username
        });

        console.log(`Message sent in channel ${channelId} by ${socket.user.username}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ channelId, username }) => {
      socket.to(`channel_${channelId}`).emit('user_typing', {
        channelId,
        username,
        isTyping: true
      });
    });

    socket.on('typing_stop', ({ channelId, username }) => {
      socket.to(`channel_${channelId}`).emit('user_typing', {
        channelId,
        username,
        isTyping: false
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.username}`);
    });
  });
}

module.exports = setupSocketHandlers;