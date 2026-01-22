// System prompts based on user role
const { executeHRDatabaseQuery, formatQueryResult } = require('./hrQueryParser');
const EMPLOYEE_SYSTEM_PROMPT = `You are a helpful WinWire company information assistant for employees. 
You ONLY provide information about WinWire company, its services, products, and processes.

IMPORTANT RULES:
1. Only answer questions related to WinWire company information
2. Do NOT provide any database information, employee data, or internal HR data
3. Do NOT execute any queries or access internal systems
4. If asked about database, employee records, or internal systems, politely decline
5. Be professional and accurate in all responses
6. If you don't know specific WinWire information, say so honestly
7. Keep responses concise and helpful

WinWire Company Information:
- IT services and consulting firm
- Specializes in digital transformation, cloud solutions, and enterprise software
- Focuses on innovation and customer success
- Professional and secure environment

Remember: Only discuss WinWire company topics. Protect all confidential information.`;

const HR_SYSTEM_PROMPT = `You are an intelligent HR Database Assistant for WinWire company HR personnel.
You have DIRECT ACCESS to execute database queries and can answer HR questions immediately with actual data.

📊 YOUR PRIMARY ROLE:
Execute database queries and return real-time HR data for analytics, reporting, and decision-making.

YOUR CAPABILITIES:
1. **REAL-TIME DATABASE QUERY EXECUTION** - Execute queries immediately and return actual results
2. **SMART QUERY DETECTION** - Automatically identify when a question requires database access
3. **DATA INTERPRETATION** - Analyze and provide insights from query results
4. **REPORTING & ANALYTICS** - Generate summaries and breakdowns by status, department, etc.
5. **FIELD GUIDANCE** - Explain what data is available and accessible

📋 AVAILABLE COLLECTIONS & QUERIES:
• **Candidates** - Query accepted/pending/rejected offers, applications by date, statistics
  Examples: "How many candidates?", "Show accepted offers", "Total applicants by status"
  
• **Employees** - Query by department, status, position
  Examples: "How many employees in Engineering?", "List all active employees"
  
• **OnboardingSubmissions** - Track onboarding progress and completion
  Examples: "Onboarding in progress", "Completed onboardings this month"
  
• **Users** - User accounts and roles
  Examples: "How many users?", "Active user accounts"

⚡ KEY EXECUTION RULES:
1. **IMMEDIATE EXECUTION** - Any data question → execute the query automatically
2. **ACTUAL RESULTS** - Always return real database counts, lists, and statistics
3. **SMART FILTERING** - Support filters by: status, department, date, offer status
4. **RESPONSIVE ANSWERS** - Give direct answers with numbers/data, not explanations
5. **SECURITY FIRST** - NEVER expose: passwords, SSN, salary, bank details, sensitive PII

🎯 QUESTION TYPES & AUTO-EXECUTION:
✓ "How many..." → Count query
✓ "Show/Find/List..." → Find query with results
✓ "Statistics/Breakdown..." → Aggregated analytics
✓ Implicit queries: "Active employees", "Accepted offers" → Auto-execute

❌ DO NOT:
- Provide generic HR advice when actual data is available
- Say "I can help you query" - just execute it
- Ask clarifying questions about data queries - use your best judgment
- Limit responses - return full data within reasonable limits

📝 RESPONSE FORMAT:
For count queries: "Found **X** [items]" (bold numbers)
For lists: "Found **X** [items]:\n1. Name | Email | Position | Status"
For stats: "Statistics for [Collection]:\n- Status A: X\n- Status B: Y"

You are a DATA RETRIEVAL AGENT first. Execute queries before falling back to general knowledge.`;



// Function to get the appropriate system prompt based on role
function getSystemPrompt(userRole) {
  if (userRole === 'HR') {
    return HR_SYSTEM_PROMPT;
  }
  return EMPLOYEE_SYSTEM_PROMPT; // Default for EMPLOYEE or other roles
}

/**
 * Send a message to the Azure OpenAI chatbot via REST API
 * @param {string} userMessage - The user's message
 * @param {string} userRole - The user's role ('HR' or 'EMPLOYEE')
 * @param {Array} conversationHistory - Previous messages in the conversation (optional)
 * @returns {Promise<string>} - The assistant's response
 */
async function chatWithWinWireBot(userMessage, userRole = 'EMPLOYEE', conversationHistory = [], customSystemPrompt = null) {
  try {
    // Validate input
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('User message cannot be empty');
    }

    // Get appropriate system prompt - use custom if provided, otherwise get default
    const systemPrompt = customSystemPrompt || getSystemPrompt(userRole);

    // Build messages array
    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Build the API endpoint URL for Azure OpenAI
    // Format: {endpoint}/openai/deployments/{deployment-name}/chat/completions?api-version={api-version}
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT;
    const fullUrl = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${deploymentName}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;
    
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('🤖 WINWIRE CHATBOT REQUEST');
    console.log('═══════════════════════════════════════════════');
    console.log('User Role:', userRole);
    console.log('User Message:', userMessage);
    console.log('Deployment:', deploymentName);
    console.log('URL:', fullUrl.replace(process.env.AZURE_OPENAI_API_KEY, '****'));
    console.log('───────────────────────────────────────────────');

    // For HR users, ALWAYS try to execute database queries FIRST and STRICTLY
    if (userRole === 'HR') {
      console.log('🔍 Checking for HR database query...');
      console.log('📝 Message:', userMessage);
      try {
        const queryResult = await executeHRDatabaseQuery(userMessage);
        if (queryResult) {
          const formattedResult = formatQueryResult(queryResult);
          console.log('✅ HR Database query executed successfully');
          console.log('📊 Query Type:', queryResult.type);
          console.log('📊 Collection:', queryResult.collection);
          if (queryResult.count !== undefined) {
            console.log('📊 Count:', queryResult.count);
          }
          return formattedResult;
        } else {
          console.log('⚠️  Not a database query pattern - only Azure OpenAI can answer this');
          // For HR users, if it doesn't match database pattern, we can use Azure
          // But log clearly that we're using AI, not database
        }
      } catch (error) {
        console.log('❌ Database query execution error:', error.message);
        console.log('🔄 Falling back to Azure OpenAI...');
      }
    }

    // Call Azure OpenAI API via REST API
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.95,
      }),
    });

    console.log('📊 Azure Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Azure API Error (Status ' + response.status + '):', errorData);
      throw new Error(`Azure API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('✅ Successfully got response from Azure Foundry');

    // Extract and return the response
    if (data.choices && data.choices.length > 0) {
      console.log('✅ Got response from Azure');
      return data.choices[0].message.content;
    } else {
      throw new Error('No response from Azure OpenAI');
    }
  } catch (error) {
    console.error('❌ Chatbot Error:', error.message);
    throw error;
  }
}

/**
 * Stream a message to the Azure OpenAI chatbot (for real-time responses)
 * @param {string} userMessage - The user's message
 * @param {string} userRole - The user's role ('HR' or 'EMPLOYEE')
 * @param {Array} conversationHistory - Previous messages in the conversation (optional)
 * @returns {AsyncGenerator} - Stream of response chunks
 */
async function* streamChatWithWinWireBot(userMessage, userRole = 'EMPLOYEE', conversationHistory = []) {
  try {
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('User message cannot be empty');
    }

    // Get appropriate system prompt based on role
    const systemPrompt = getSystemPrompt(userRole);

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Build the API endpoint URL
    const endpoint = `${process.env.AZURE_OPENAI_ENDPOINT}/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY,
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 2048,
        temperature: 0.7,
        top_p: 0.95,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Azure API Error: ${response.status} - ${errorData}`);
    }

    // Read streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                yield parsed.choices[0].delta.content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('❌ Stream Chatbot Error:', error.message);
    throw error;
  }
}

module.exports = {
  chatWithWinWireBot,
  streamChatWithWinWireBot,
  EMPLOYEE_SYSTEM_PROMPT,
  HR_SYSTEM_PROMPT,
  getSystemPrompt,
};
