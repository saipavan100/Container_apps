import React, { useState, useRef, useEffect } from 'react';
import './WinWireChat.css';

const WinWireChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Get backend URL from environment or use default
  const getBackendURL = () => {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isLocalhost) {
      const port = window.location.port;
      // If on port 3000 (React dev server), backend is on port 8080
      if (port === '3000' || port === '') {
        return 'http://localhost:8080/api';
      }
    }
    // Production/Single service (both on same domain/port)
    return '/api';
  };
  const BACKEND_URL = getBackendURL();

  // Get user role and load prompts on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role) {
          // User role is available from localStorage if needed
          console.log('Chatbot User Role:', user.role);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Load available prompts
    loadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPrompts = async () => {
    try {
      setPromptsLoading(true);
      console.log(` WinWireChat: Loading prompts from ${BACKEND_URL}/chatbot/prompts`);
      
      const response = await fetch(`${BACKEND_URL}/chatbot/prompts`);
      if (!response.ok) throw new Error(`Failed to load prompts: ${response.status}`);
      
      const data = await response.json();
      // Flatten prompts by category
      const allPrompts = [];
      Object.entries(data.prompts).forEach(([category, categoryPrompts]) => {
        categoryPrompts.forEach(prompt => {
          allPrompts.push({
            ...prompt,
            category: category
          });
        });
      });
      setPrompts(allPrompts);
      console.log('✅ Loaded prompts:', allPrompts.length);
    } catch (error) {
      console.error('❌ Error loading prompts:', error);
    } finally {
      setPromptsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePromptClick = async (promptId, label, emoji) => {
    // Add prompt as user message
    const userMessage = {
      id: Date.now(),
      text: `${emoji} ${label}`,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Send prompt execution request to backend
      const apiUrl = `${BACKEND_URL}/chatbot/execute-prompt`;
      console.log('Executing prompt:', promptId);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: promptId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to execute prompt: ${response.status}`);
      }

      const data = await response.json();

      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        text: data.result || data.error,
        sender: 'bot',
        timestamp: new Date(),
        isError: !data.success,
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);

      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="winwire-chat-container">
      <button
        className="chat-toggle-btn"
        onClick={() => setShowChat(!showChat)}
        title="Toggle Chat"
      >
        💬
      </button>

      {showChat && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>WinWire Assistant</h3>
            <div className="chat-actions">
              <button
                className="clear-btn"
                onClick={handleClearChat}
                title="Clear chat history"
              >
                🗑️
              </button>
              <button
                className="close-btn"
                onClick={() => setShowChat(false)}
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>👋 Hi! I'm the WinWire Assistant.</p>
                <p>Choose a question below to get database information!</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender} ${
                      msg.isError ? 'error' : ''
                    }`}
                  >
                    <div className="message-avatar">
                      {msg.sender === 'user' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="timestamp">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message bot">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Prompts Grid */}
          <div className="prompts-grid">
            {promptsLoading ? (
              <div className="loading-prompts">Loading prompts...</div>
            ) : prompts.length > 0 ? (
              prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  className="prompt-btn"
                  onClick={() => handlePromptClick(prompt.id, prompt.label, prompt.emoji)}
                  disabled={loading}
                  title={prompt.description}
                >
                  <span className="prompt-emoji">{prompt.emoji}</span>
                  <span className="prompt-label">{prompt.label}</span>
                </button>
              ))
            ) : (
              <div className="no-prompts">No prompts available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WinWireChat;
