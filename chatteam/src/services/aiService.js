import axios from "axios";

class AIService {
  constructor() {
    // Hugging Face Inference API base
    this.apiUrl = "https://api-inference.huggingface.co/models/";

    // Safe environment variable detection:
    // - Create React App uses process.env.REACT_APP_...
    // - Vite uses import.meta.env.VITE_...
    // Use typeof checks so this file doesn't crash in the browser.
    this.apiKey =
      (typeof process !== "undefined" && process.env.REACT_APP_HUGGINGFACE_API_KEY) ||
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_HUGGINGFACE_API_KEY) ||
      null;

    // Default model(s)
    this.models = {
      chat: "microsoft/DialoGPT-medium",
      // Alternatives:
      // 'facebook/blenderbot-400M-distill'
      // 'google/flan-t5-base'
      // 'bigscience/bloom-560m'
    };
  }

  async getAIResponse(userMessage) {
    try {
      // If API key present, call real Hugging Face inference API
      if (this.apiKey) {
        const response = await axios.post(
          `${this.apiUrl}${this.models.chat}`,
          {
            inputs: userMessage,
            parameters: {
              max_length: 200,
              min_length: 20,
              temperature: 0.7,
              top_p: 0.9,
              do_sample: true,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Hugging Face responses vary — handle common shapes
        if (Array.isArray(response.data)) {
          return response.data[0]?.generated_text || this.getDemoResponse(userMessage);
        } else if (response.data?.generated_text) {
          return response.data.generated_text;
        } else if (response.data?.error) {
          // API returned an error payload
          console.warn("HF returned error:", response.data);
          return this.getDemoResponse(userMessage);
        } else {
          return this.getDemoResponse(userMessage);
        }
      } else {
        // No API key: fallback to demo response
        return this.getDemoResponse(userMessage);
      }
    } catch (error) {
      // Helpful logging for development
      console.error("Hugging Face API Error:", error.response?.data || error.message || error);

      // If model is still loading on HF, communicate that
      const errMsg = error.response?.data?.error || "";
      if (errMsg.toLowerCase().includes("loading")) {
        return "The AI model is currently loading. Please try again in a moment! Meanwhile, I can help with questions about React, JavaScript, and programming. 😊";
      }

      return this.getDemoResponse(userMessage);
    }
  }

  getDemoResponse(question) {
    const lowerQ = (question || "").toLowerCase();

    const responses = {
      react:
        "React is a popular JavaScript library for building user interfaces. It uses a component-based architecture and virtual DOM for efficient rendering. Key features include JSX syntax, hooks for state management, and a unidirectional data flow! 🚀",
      weather:
        "I don't have access to live weather data in this demo, but I can help you with coding questions, explain technical concepts, or assist with your team's workflow! ☁️",
      webhook:
        "Webhooks are automated messages sent from apps when something happens. They're HTTP callbacks that deliver data to other applications in real-time. Think of them as 'reverse APIs'! 🔔",
      javascript:
        "JavaScript is a versatile programming language that powers interactive web experiences. Tips for learning: practice daily with small projects, understand async/await and promises, learn ES6+ features! 💻",
      python:
        "Python is a beginner-friendly language great for web development, data science, and automation. Key concepts: indentation matters, dynamic typing, extensive libraries like NumPy and Pandas! 🐍",
      html:
        "HTML is the backbone of web pages. It defines structure using tags like <div>, <p>, <a>, <img>. HTML5 added semantic tags like <header>, <nav>, <section> for better structure! 📄",
      css:
        "CSS styles your web pages! Learn Flexbox for layouts, Grid for complex designs, and animations for interactivity. Modern CSS features: variables, calc(), clamp()! 🎨",
      nodejs:
        "Node.js lets you run JavaScript on the server! It's fast, event-driven, and perfect for building APIs and real-time applications like this chat app! ⚡",
      database:
        "Databases store your data! SQL databases (MySQL, PostgreSQL) are great for structured data. NoSQL (MongoDB, Redis) are flexible for dynamic schemas. Choose based on your needs! 🗄️",
      api:
        "APIs let applications communicate! REST uses HTTP methods (GET, POST, PUT, DELETE). GraphQL lets you query exactly what you need. WebSockets enable real-time data! 🔌",
      git:
        "Git is version control for code! Key commands: git add, git commit, git push, git pull. Use branches for features, merge when done. GitHub/GitLab for collaboration! 📦",
      help:
        "I'm here to help! You can ask me about programming concepts, coding best practices, web development, or how to use features in this chat app. What would you like to know? 🤔",
      greeting:
        "Hello! 👋 I'm the AI Assistant. I can help answer questions about coding, technology, and team collaboration. Try asking me about React, JavaScript, Python, or web development!",
    };

    if (lowerQ.includes("react")) return responses.react;
    if (lowerQ.includes("weather")) return responses.weather;
    if (lowerQ.includes("webhook")) return responses.webhook;
    if (lowerQ.includes("javascript") || lowerQ.includes("js")) return responses.javascript;
    if (lowerQ.includes("python") || lowerQ.includes("py")) return responses.python;
    if (lowerQ.includes("html")) return responses.html;
    if (lowerQ.includes("css") || lowerQ.includes("style")) return responses.css;
    if (lowerQ.includes("node") || lowerQ.includes("nodejs")) return responses.nodejs;
    if (lowerQ.includes("database") || lowerQ.includes("sql") || lowerQ.includes("mysql")) return responses.database;
    if (lowerQ.includes("api") || lowerQ.includes("rest")) return responses.api;
    if (lowerQ.includes("git") || lowerQ.includes("github")) return responses.git;
    if (lowerQ.includes("help") || lowerQ.includes("how")) return responses.help;
    if (lowerQ.includes("hi") || lowerQ.includes("hello") || lowerQ.includes("hey")) return responses.greeting;
    if (lowerQ.includes("thank") || lowerQ.includes("thanks")) return "You're welcome! Happy to help! 😊";

    return "That's an interesting question! Try asking about topics like React, JavaScript, Python, HTML, CSS, Node.js, databases, APIs, or general programming help! 💡";
  }

  // Should this message trigger AI?
  shouldTriggerAI(message, channelName) {
    return channelName === "ai-help" || (message && message.toLowerCase().includes("@ai"));
  }
}

export default new AIService();
