import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    // In production, use your actual backend URL
    this.socket = io('http://localhost:5000', {
      auth: { token }
      });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Send message to channel
  sendMessage(channelId, message) {
    if (this.socket) {
      this.socket.emit('send_message', { channelId, message });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // Join a channel room
  joinChannel(channelId) {
    if (this.socket) {
      this.socket.emit('join_channel', channelId);
    }
  }

  // Leave a channel room
  leaveChannel(channelId) {
    if (this.socket) {
      this.socket.emit('leave_channel', channelId);
    }
  }

  // Typing indicator
  startTyping(channelId, username) {
    if (this.socket) {
      this.socket.emit('typing_start', { channelId, username });
    }
  }

  stopTyping(channelId, username) {
    if (this.socket) {
      this.socket.emit('typing_stop', { channelId, username });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }
}

export default new SocketService();