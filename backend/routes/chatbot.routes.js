const express = require('express');
const { chatWithWinWireBot, streamChatWithWinWireBot } = require('../utils/chatbotService');
const { executeTemplate, getQueryTemplates, isValidTemplate } = require('../utils/queryTemplates');
const { formatQueryResult } = require('../utils/hrQueryParser');
const predefinedPrompts = require('../config/predefinedPrompts');
const winwireInfo = require('../config/winwireInfo');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * POST /api/chatbot/company-info
 * Employee chatbot with AI enhancement using company file as system prompt
 * Uses guard rails to stay within company information only
 * Body: { query: string }
 */
router.post('/company-info', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query cannot be empty',
      });
    }

    const searchQuery = query.toLowerCase().trim();
    console.log('\n════════════════════════════════════════════════════════');
    console.log('🔍 EMPLOYEE CHATBOT - COMPANY INFO WITH AI ENHANCEMENT');
    console.log('════════════════════════════════════════════════════════');
    console.log('Query:', query);
    console.log('────────────────────────────────────────────────────────');

    // Guard Rail 1: Check for out-of-box questions
    const outOfBoxKeywords = [
      'employee record', 'salary slip', 'password', 'password', 'access code', 
      'database', 'server', 'internal system', 'confidential', 'secret',
      'other company', 'competitor', 'stock price', 'financial result',
      'personal data', 'ssn', 'bank', 'credit card', 'personal information'
    ];

    const isOutOfBox = outOfBoxKeywords.some(kw => searchQuery.includes(kw));
    
    if (isOutOfBox) {
      return res.json({
        success: true,
        query: query,
        found: false,
        message: '🔐 I can only provide information about WinWire company, services, culture, and benefits. I cannot access personal data, employee records, or confidential information. Please ask about company-related topics!',
        dataSource: '📄 WinWire Company File (Secure)',
      });
    }

    // Build comprehensive system prompt with all company information
    const buildSystemPrompt = () => {
      const companyData = {
        company: winwireInfo.company,
        services: winwireInfo.services,
        departments: winwireInfo.departments,
        adminTeam: winwireInfo.adminTeam,
        benefits: winwireInfo.benefits,
        culture: winwireInfo.culture,
        onboarding: winwireInfo.onboarding,
        faqs: winwireInfo.faqs,
        offices: winwireInfo.offices,
        contactInfo: winwireInfo.contactInfo,
      };

      return `You are a friendly and helpful WinWire company assistant for new employees and candidates.

YOUR CONTEXT - COMPLETE WINWIRE COMPANY INFORMATION:
${JSON.stringify(companyData, null, 2)}

YOUR GUIDELINES:
1. COMPANY-ONLY: Only discuss WinWire company information provided above. Do NOT discuss other companies or topics.
2. ACCURACY: Use ONLY the information provided in the context above. Do NOT make up facts or details.
3. FRIENDLY: Be warm, welcoming, and professional in your tone.
4. HELPFUL: Answer questions naturally and conversationally.
5. COMPLETE: Reference specific details from the company data when relevant.
6. SECURITY: Never share confidential information or employee personal data.
7. HONEST: If you don't know something, say so and suggest what information IS available.

RESPOND TO:
- Greetings: Welcome them warmly and offer to help with company information
- Company questions: Use the context data to provide helpful answers
- About us: Share mission, vision, services, culture
- Career questions: Explain benefits, growth, interview process
- General questions: Redirect to company-related topics if off-topic

DO NOT RESPOND TO:
- Requests for employee data, passwords, or confidential info
- Questions about other companies or external topics
- Financial details beyond what's in company FAQs
- Personal advice unrelated to WinWire

Keep responses concise, friendly, and focused on helping them understand WinWire.`;
    };

    const systemPrompt = buildSystemPrompt();

    console.log('✅ Guard rails passed - processing with AI');

    // Use AI with company info as system prompt
    try {
      const { chatWithWinWireBot } = require('../utils/chatbotService');
      
      const aiResponse = await chatWithWinWireBot(query, 'EMPLOYEE', [], systemPrompt);
      
      res.json({
        success: true,
        query: query,
        found: true,
        message: aiResponse,
        dataSource: '📄 WinWire Company File + AI Enhancement',
        mode: 'AI-Powered with Company Context',
      });

      console.log('✅ AI response generated');
    } catch (aiError) {
      console.warn('⚠️ AI enhancement failed:', aiError.message);
      
      // Fallback: Return company-only information
      res.json({
        success: true,
        query: query,
        found: true,
        message: `I can help you with WinWire company information! I have details about:\n• Company mission, vision, and history\n• Our services (Cloud, AI/ML, Web Development, Consulting)\n• Team and leadership\n• Employee benefits and perks\n• Office locations\n• Company culture and values\n• FAQs about applying and working here\n\nWhat would you like to know?`,
        dataSource: '📄 WinWire Company File (Fallback Mode)',
      });
    }

    console.log('════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Company Info Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process your request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/chatbot/prompts
 * Get all predefined HR prompts (NO HALLUCINATION - ONLY DATABASE QUERIES)
 */
router.get('/prompts', (req, res) => {
  try {
    // Group prompts by category
    const grouped = {};
    predefinedPrompts.forEach(prompt => {
      if (!grouped[prompt.category]) {
        grouped[prompt.category] = [];
      }
      grouped[prompt.category].push({
        id: prompt.id,
        label: prompt.label,
        emoji: prompt.emoji,
        description: prompt.description,
      });
    });

    res.json({
      success: true,
      message: '✅ ZERO HALLUCINATION - These are predefined database queries only',
      instructions: 'HR users should SELECT from these prompts. Each executes a strict database query with real data only.',
      categories: Object.keys(grouped),
      prompts: grouped,
      total: predefinedPrompts.length,
    });
  } catch (error) {
    console.error('Prompts Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get prompts',
    });
  }
});

/**
 * POST /api/chatbot/execute-prompt
 * Execute a predefined prompt (STRICT DATABASE ONLY - NO HALLUCINATION)
 * Body: { promptId: string }
 */
router.post('/execute-prompt', async (req, res) => {
  try {
    const { promptId } = req.body;

    if (!promptId) {
      return res.status(400).json({
        success: false,
        error: 'promptId is required',
        hint: 'Get available prompts from GET /api/chatbot/prompts',
      });
    }

    // Find the prompt
    const prompt = predefinedPrompts.find(p => p.id === promptId);
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Invalid promptId',
        availablePrompts: predefinedPrompts.map(p => p.id),
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 EXECUTING PREDEFINED PROMPT (DATABASE ONLY)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Prompt ID:', promptId);
    console.log('Label:', prompt.label);
    console.log('Query:', prompt.query);
    console.log('Category:', prompt.category);
    console.log('───────────────────────────────────────────────────────────');

    // Execute the query
    const { executeHRDatabaseQuery } = require('../utils/hrQueryParser');
    const queryResult = await executeHRDatabaseQuery(prompt.query);

    if (!queryResult) {
      return res.status(400).json({
        success: false,
        error: 'Query did not match database patterns',
        prompt: prompt,
      });
    }

    // Format result
    const formattedResult = formatQueryResult(queryResult);

    res.json({
      success: true,
      promptId: promptId,
      prompt: {
        label: prompt.label,
        emoji: prompt.emoji,
        category: prompt.category,
        description: prompt.description,
      },
      dataSource: '✅ STRICT DATABASE ONLY - NO HALLUCINATION',
      result: formattedResult,
      metadata: {
        queryType: queryResult.type,
        collection: queryResult.collection,
        recordCount: queryResult.count,
        filters: queryResult.filters || {},
        timestamp: new Date(),
      }
    });

    console.log('✅ Prompt executed successfully');
    console.log('Records found:', queryResult.count);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Prompt Execution Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to execute prompt',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/chatbot/message
 * Send a message to the WinWire chatbot
 * Body: { message: string, userRole?: string, conversationHistory?: Array }
 * userRole: 'HR' or 'EMPLOYEE' (default: 'EMPLOYEE')
 */
router.post('/message', async (req, res) => {
  try {
    const { message, userRole = 'EMPLOYEE', conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty',
      });
    }

    // Validate user role
    const validRoles = ['HR', 'EMPLOYEE'];
    const role = validRoles.includes(userRole) ? userRole : 'EMPLOYEE';

    // Limit conversation history to last 10 messages to avoid token limits
    const limitedHistory = conversationHistory.slice(-10);

    const response = await chatWithWinWireBot(message, role, limitedHistory);

    res.json({
      success: true,
      message: message,
      userRole: role,
      response: response,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get response from chatbot. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/chatbot/stream
 * Stream a message to the WinWire chatbot (real-time response)
 * Body: { message: string, userRole?: string, conversationHistory?: Array }
 * userRole: 'HR' or 'EMPLOYEE' (default: 'EMPLOYEE')
 */
router.post('/stream', async (req, res) => {
  try {
    const { message, userRole = 'EMPLOYEE', conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message cannot be empty',
      });
    }

    // Validate user role
    const validRoles = ['HR', 'EMPLOYEE'];
    const role = validRoles.includes(userRole) ? userRole : 'EMPLOYEE';

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const limitedHistory = conversationHistory.slice(-10);

    // Stream the response
    for await (const chunk of streamChatWithWinWireBot(message, role, limitedHistory)) {
      res.write(`data: ${JSON.stringify({ chunk: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream Chatbot Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stream response from chatbot',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/chatbot/templates
 * Get all available query templates for HR users
 */
router.get('/templates', (req, res) => {
  try {
    const templates = getQueryTemplates();
    res.json({
      success: true,
      message: 'Available query templates for HR users - NO HALLUCINATION, ONLY REAL DATA',
      count: templates.length,
      templates: templates,
      instructions: 'HR users should select from these templates to query the database. This ensures accurate, real data only.'
    });
  } catch (error) {
    console.error('Templates Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
});

/**
 * POST /api/chatbot/execute-template
 * Execute a predefined query template
 * Body: { templateId: string }
 * This endpoint ONLY returns real database data, NO hallucination
 */
router.post('/execute-template', async (req, res) => {
  try {
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'templateId is required',
        hint: 'Get available templates from GET /api/chatbot/templates'
      });
    }

    if (!isValidTemplate(templateId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID',
        hint: `Get available templates from GET /api/chatbot/templates`
      });
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 EXECUTING TEMPLATE-BASED QUERY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Template ID:', templateId);
    console.log('Timestamp:', new Date().toISOString());
    console.log('───────────────────────────────────────────────────────────');

    // Execute the template
    const queryResult = await executeTemplate(templateId);
    
    // Format the result
    const formattedResult = formatQueryResult(queryResult);

    res.json({
      success: true,
      templateId: templateId,
      dataSource: 'DATABASE ONLY - NO HALLUCINATION',
      result: formattedResult,
      metadata: {
        queryType: queryResult.type,
        collection: queryResult.collection,
        recordCount: queryResult.count,
        timestamp: new Date(),
      }
    });

    console.log('✅ Template query completed successfully');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('Template Execution Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute template',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/chatbot/health
 * Check if chatbot service is available
 */
router.get('/health', (req, res) => {
  const isConfigured = !!(
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY
  );

  res.json({
    status: isConfigured ? 'available' : 'not-configured',
    configured: isConfigured,
    endpoint: isConfigured ? process.env.AZURE_OPENAI_ENDPOINT : null,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION,
    apiKeyLength: process.env.AZURE_OPENAI_API_KEY ? process.env.AZURE_OPENAI_API_KEY.length : 0,
  });
});

module.exports = router;
