import { useState, useEffect } from 'react';
import socketService from '../services/socketService.js';
import aiService from '../services/aiService.js';

export function useChat(user) {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [aiTyping, setAiTyping] = useState(false);

  // Initialize demo teams
  useEffect(() => {
    const demoTeams = [
      {
        id: 1,
        name: 'My Workspace',
        channels: [
          { id: 1, name: 'general', messages: [] },
          { id: 2, name: 'random', messages: [] },
          { id: 3, name: 'ai-help', messages: [] }
        ]
      }
    ];
    setTeams(demoTeams);
  }, []);

  // Setup socket connection
  useEffect(() => {
    if (user) {
      socketService.connect(user.token);

      socketService.onNewMessage((message) => {
        if (message.channelId === selectedChannel?.id) {
          setMessages(prev => [...prev, message]);
        }
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [user, selectedChannel]);

  const selectChannel = (team, channel) => {
    setSelectedTeam(team);
    setSelectedChannel(channel);
    setMessages(channel.messages || []);
    
    // Join channel room
    if (socketService.socket) {
      socketService.joinChannel(channel.id);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !selectedChannel) return;

    const newMessage = {
      id: Date.now(),
      channelId: selectedChannel.id,
      userId: user.id,
      username: user.username,
      text: text,
      timestamp: new Date().toISOString(),
      isAI: false
    };

    // Add message locally
    setMessages(prev => [...prev, newMessage]);

    // Send via socket
    socketService.sendMessage(selectedChannel.id, newMessage);

    // Check if AI should respond
    if (aiService.shouldTriggerAI(text, selectedChannel.name)) {
      setAiTyping(true);

      try {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get AI response
        const aiResponse = await aiService.getAIResponse(text);

        const aiMessage = {
          id: Date.now() + 1,
          channelId: selectedChannel.id,
          userId: 'ai',
          username: 'AI Assistant',
          text: aiResponse,
          timestamp: new Date().toISOString(),
          isAI: true
        };

        setMessages(prev => [...prev, aiMessage]);
        socketService.sendMessage(selectedChannel.id, aiMessage);
      } catch (error) {
        console.error('AI Error:', error);
      } finally {
        setAiTyping(false);
      }
    }
  };

  const createTeam = (teamName) => {
    const newTeam = {
      id: Date.now(),
      name: teamName,
      channels: [
        { id: Date.now() + 1, name: 'general', messages: [] }
      ]
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const createChannel = (team, channelName) => {
    const newChannel = {
      id: Date.now(),
      name: channelName.toLowerCase().replace(/\s+/g, '-'),
      messages: []
    };

    setTeams(prev => prev.map(t => 
      t.id === team.id 
        ? { ...t, channels: [...t.channels, newChannel] }
        : t
    ));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChannel) return;

    const fileMessage = {
      id: Date.now(),
      channelId: selectedChannel.id,
      userId: user.id,
      username: user.username,
      text: `📎 Shared file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      timestamp: new Date().toISOString(),
      isAI: false,
      isFile: true
    };

    setMessages(prev => [...prev, fileMessage]);
    socketService.sendMessage(selectedChannel.id, fileMessage);
  };

  return {
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
  };
}