const express = require('express');
const predefinedPrompts = require('../config/predefinedPrompts');
const { executeHRDatabaseQuery, formatQueryResult } = require('../utils/hrQueryParser');

const router = express.Router();

/**
 * GET /api/prompts
 * Get all predefined HR prompts
 * Frontend uses this to display prompt buttons to HR users
 */
router.get('/', (req, res) => {
  try {
    // Group by category
    const grouped = {};
    predefinedPrompts.forEach(prompt => {
      if (!grouped[prompt.category]) {
        grouped[prompt.category] = [];
      }
      grouped[prompt.category].push({
        id: prompt.id,
        label: prompt.label,
        emoji: prompt.emoji,
        description: prompt.description
      });
    });

    res.json({
      success: true,
      message: 'Predefined HR prompts - NO HALLUCINATION, ONLY REAL DATABASE DATA',
      totalPrompts: predefinedPrompts.length,
      categories: Object.keys(grouped),
      prompts: grouped
    });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prompts'
    });
  }
});

/**
 * POST /api/prompts/execute
 * Execute a predefined prompt by ID
 * This ensures the backend executes EXACTLY the validated query
 * Body: { promptId: string }
 */
router.post('/execute', async (req, res) => {
  try {
    const { promptId } = req.body;

    if (!promptId) {
      return res.status(400).json({
        success: false,
        error: 'promptId is required'
      });
    }

    // Find the prompt
    const prompt = predefinedPrompts.find(p => p.id === promptId);
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: `Invalid prompt ID: ${promptId}`
      });
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 EXECUTING PREDEFINED PROMPT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Prompt ID:', promptId);
    console.log('Label:', prompt.label);
    console.log('Category:', prompt.category);
    console.log('Query:', prompt.query);
    console.log('Timestamp:', new Date().toISOString());
    console.log('───────────────────────────────────────────────────────────');

    // Execute the predefined query
    const queryResult = await executeHRDatabaseQuery(prompt.query);

    if (!queryResult) {
      return res.status(500).json({
        success: false,
        error: 'Query could not be executed',
        promptId: promptId
      });
    }

    // Format the result
    const formattedResult = formatQueryResult(queryResult);

    console.log('✅ Prompt executed successfully');
    console.log('═══════════════════════════════════════════════════════════');

    res.json({
      success: true,
      promptId: promptId,
      label: prompt.label,
      category: prompt.category,
      dataSource: 'DATABASE ONLY - STRICT, NO HALLUCINATION',
      response: formattedResult,
      metadata: {
        queryType: queryResult.type,
        collection: queryResult.collection,
        recordCount: queryResult.count || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Prompt Execution Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute prompt',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
