import React, { useState, useRef, useEffect } from 'react';
import './EmployeeChatbot.css';

const EmployeeChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Get backend URL
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on first open
  useEffect(() => {
    if (showChat && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now(),
        text: '👋 Hi! I can answer questions about WinWire company, culture, benefits, services, and team. Ask me anything!',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setLoading(true);

    try {
      console.log(`🤖 Chatbot: Sending to ${BACKEND_URL}/chatbot/company-info`);
      
      // Send to company info endpoint (STRICTLY LOCAL FILE, NO WEB)
      const response = await fetch(`${BACKEND_URL}/chatbot/company-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
        }),
      });

      console.log(`🤖 Chatbot: Response status ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Format response
      let responseText = '';
      if (!data.found) {
        responseText = data.message;
      } else {
        // Use AI-enhanced message if available
        if (data.message && typeof data.message === 'string') {
          responseText = data.message;
        } else {
          // Fallback to raw data formatting
          responseText = data.results
            .map((result) => {
              let content = `📄 ${result.section}:\n`;
              if (Array.isArray(result.data)) {
                content += result.data
                  .map((item) => {
                    if (typeof item === 'string') {
                      return `• ${item}`;
                    }
                    if (item.name) {
                      return `• ${item.name}: ${item.description || ''}`;
                    }
                    if (item.question) {
                      return `• Q: ${item.question}\n  A: ${item.answer}`;
                    }
                    if (item.title) {
                      return `• ${item.name} - ${item.title}`;
                    }
                    return `• ${JSON.stringify(item).substring(0, 100)}`;
                  })
                  .join('\n');
              } else if (typeof result.data === 'object') {
                content += Object.entries(result.data)
                  .map(([key, value]) => `• ${key}: ${value}`)
                  .join('\n');
              }
              return content;
            })
            .join('\n\n');
        }
      }

      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        dataSource: data.dataSource,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);

      const errorMessage = {
        id: Date.now() + 1,
        text: `❌ Error: ${error.message}. Please try again.`,
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

  const suggestedQuestions = [
    '👋 About WinWire',
    '🛠️ Services',
    '💼 Benefits',
    '👥 Team Members',
    '📍 Offices',
    '🎯 Culture',
    '💰 Salary & Compensation',
    '🚀 How to apply?',
  ];

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
  };

  return (
    <div className="employee-chatbot-container">
      <button
        className="chatbot-toggle-btn"
        onClick={() => setShowChat(!showChat)}
        title="Toggle Company Info Chat"
      >
        💬
      </button>

      {showChat && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <h3>🏢 WinWire Info</h3>
              <p>Powered by Company File (No Web)</p>
            </div>
            <div className="chatbot-actions">
              <button
                className="clear-btn"
                onClick={handleClearChat}
                title="Clear chat"
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}
              >
                <div className="message-avatar">
                  {msg.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <p>{msg.text}</p>
                  {msg.dataSource && (
                    <span className="data-source">{msg.dataSource}</span>
                  )}
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
          </div>

          {messages.length === 1 && (
            <div className="suggested-questions">
              <p className="suggested-label">Try asking about:</p>
              <div className="suggested-grid">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="suggested-btn"
                    onClick={() => handleSuggestedQuestion(question)}
                    disabled={loading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className="input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about WinWire (culture, benefits, team...)..."
              disabled={loading}
              className="message-input"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="send-btn"
            >
              {loading ? '...' : '➤'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeeChatbot;
