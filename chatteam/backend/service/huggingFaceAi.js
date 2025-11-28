const axios = require('axios');

class HuggingFaceAI {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    // Using free models
    this.models = {
      chat: 'microsoft/DialoGPT-medium',
      // Alternative: 'facebook/blenderbot-400M-distill'
    };
  }

  async getResponse(userMessage) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.models.chat}`,
        {
          inputs: userMessage,
          parameters: {
            max_length: 200,
            temperature: 0.7
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data[0]?.generated_text || this.getDemoResponse(userMessage);
    } catch (error) {
      console.error('Hugging Face API Error:', error.message);
      return this.getDemoResponse(userMessage);
    }
  }

  getDemoResponse(question) {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('react')) {
      return "React is a popular JavaScript library for building user interfaces. It uses components, JSX, and hooks for state management!";
    } else if (lowerQ.includes('javascript') || lowerQ.includes('js')) {
      return "JavaScript is a versatile programming language. Key concepts: variables, functions, async/await, promises, and ES6+ features!";
    } else if (lowerQ.includes('help')) {
      return "I'm here to help! Ask me about programming, web development, or any tech questions!";
    } else if (lowerQ.includes('hi') || lowerQ.includes('hello')) {
      return "Hello! 👋 I'm your AI assistant. How can I help you today?";
    }
    
    return "That's interesting! Ask me about React, JavaScript, programming, or any tech topics!";
  }

  shouldTriggerAI(message, channelName) {
    return channelName === 'ai-help' || message.toLowerCase().includes('@ai');
  }
}

module.exports = new HuggingFaceAI();