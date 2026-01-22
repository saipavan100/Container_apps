/**
 * FRONTEND INTEGRATION GUIDE
 * How to integrate the predefined prompts system into WinWireChat
 */

// ============================================================================
// STEP 1: Load Prompts on Component Mount
// ============================================================================

import React, { useState, useEffect } from 'react';

export function WinWireChatPrompts() {
  const [prompts, setPrompts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [response, setResponse] = useState(null);

  // Load available prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  async function fetchPrompts() {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      setPrompts(data.prompts); // Grouped by category
      setLoading(false);
    } catch (error) {
      console.error('Failed to load prompts:', error);
      setLoading(false);
    }
  }

  // ============================================================================
  // STEP 2: Execute Prompt When User Clicks Button
  // ============================================================================

  async function executePrompt(promptId) {
    setSelectedPrompt(promptId);
    setResponse(null);

    try {
      const res = await fetch('/api/prompts/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });

      const data = await res.json();

      if (data.success) {
        setResponse(data);
        // Display the response in chat
        addMessageToChat({
          type: 'bot',
          content: data.response,
          source: 'DATABASE',
          recordCount: data.metadata.recordCount
        });
      } else {
        addMessageToChat({
          type: 'error',
          content: `Failed to execute prompt: ${data.error}`
        });
      }
    } catch (error) {
      console.error('Prompt execution error:', error);
      addMessageToChat({
        type: 'error',
        content: 'Failed to execute prompt'
      });
    }
  }

  // ============================================================================
  // STEP 3: Render Prompt Buttons by Category
  // ============================================================================

  return (
    <div className="prompt-selector">
      <h3>📊 Quick Database Queries (NO HALLUCINATION)</h3>
      <p className="subtitle">Click any prompt to query the database directly</p>

      {loading ? (
        <p>Loading prompts...</p>
      ) : (
        <div className="prompts-container">
          {Object.entries(prompts).map(([category, categoryPrompts]) => (
            <div key={category} className="prompt-category">
              <h4>{category}</h4>
              <div className="prompt-buttons">
                {categoryPrompts.map(prompt => (
                  <button
                    key={prompt.id}
                    onClick={() => executePrompt(prompt.id)}
                    className={`prompt-button ${
                      selectedPrompt === prompt.id ? 'active' : ''
                    }`}
                    title={prompt.description}
                  >
                    <span className="emoji">{prompt.emoji}</span>
                    <span className="label">{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {response && (
        <div className="response-info">
          <span className="data-source">📊 Source: DATABASE ONLY</span>
          <span className="record-count">
            Records: {response.metadata.recordCount}
          </span>
          <span className="query-type">Type: {response.metadata.queryType}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP 4: CSS Styling (Optional)
// ============================================================================

/*
.prompt-selector {
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
  margin-bottom: 20px;
}

.prompt-selector h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 13px;
  margin: 0 0 15px 0;
}

.prompts-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.prompt-category h4 {
  margin: 10px 0 8px 0;
  color: #34495e;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.prompt-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.prompt-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 2px solid #bdc3c7;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.prompt-button:hover {
  border-color: #3498db;
  background: #ecf0f1;
  transform: translateY(-2px);
}

.prompt-button.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.prompt-button .emoji {
  font-size: 16px;
}

.response-info {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  padding: 10px;
  background: #e8f4f8;
  border-radius: 6px;
  font-size: 12px;
  color: #0984e3;
}

.data-source {
  font-weight: bold;
}
*/

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================

/*
✅ TODO:
  [ ] Import this component into WinWireChat
  [ ] Add the component rendering in chat UI
  [ ] Add CSS styling (or use provided styles)
  [ ] Test each prompt returns correct database data
  [ ] Verify no hallucination occurs
  [ ] Show prompt buttons to HR users only (add role check)
  [ ] Add loading spinner during prompt execution
  [ ] Add error handling and user feedback
  [ ] Add "Clear history" button
  [ ] Add favorites/recents feature (optional)
*/

export default WinWireChatPrompts;
