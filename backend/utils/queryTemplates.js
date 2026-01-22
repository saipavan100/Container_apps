/**
 * Predefined HR Query Templates
 * These are pre-validated queries that HR users can select from
 * This ensures NO hallucination - only real database data is shown
 */

const { executeHRDatabaseQuery } = require('./hrQueryParser');

const QUERY_TEMPLATES = [
  {
    id: 'total_candidates',
    title: 'Total Candidates',
    description: 'Count all candidates in the system',
    query: 'how many total candidates',
    icon: '👥'
  },
  {
    id: 'accepted_offers',
    title: 'Accepted Offers',
    description: 'How many candidates accepted their offers',
    query: 'how many candidates with accepted offers',
    icon: '✅'
  },
  {
    id: 'pending_offers',
    title: 'Pending Offers',
    description: 'Candidates with pending offers',
    query: 'how many candidates with pending offers',
    icon: '⏳'
  },
  {
    id: 'rejected_offers',
    title: 'Rejected Offers',
    description: 'Candidates who rejected offers',
    query: 'how many candidates with rejected offers',
    icon: '❌'
  },
  {
    id: 'all_candidates',
    title: 'List All Candidates',
    description: 'Show all candidates with their details',
    query: 'show all candidates',
    icon: '📋'
  },
  {
    id: 'total_employees',
    title: 'Total Employees',
    description: 'Count all active employees',
    query: 'how many total employees',
    icon: '👔'
  },
  {
    id: 'all_employees',
    title: 'List All Employees',
    description: 'Show all employees with departments',
    query: 'list all employees',
    icon: '📑'
  },
  {
    id: 'total_users',
    title: 'Total User Accounts',
    description: 'Count all user accounts in the system',
    query: 'how many total users',
    icon: '🔐'
  },
  {
    id: 'onboarding_status',
    title: 'Onboarding Submissions',
    description: 'Check all onboarding submissions and their status',
    query: 'show all onboarding submissions',
    icon: '📊'
  },
  {
    id: 'candidate_stats',
    title: 'Candidate Statistics',
    description: 'Get breakdown of candidates by offer status',
    query: 'candidates statistics',
    icon: '📈'
  },
  {
    id: 'employee_stats',
    title: 'Employee Statistics',
    description: 'Get breakdown of employees by department',
    query: 'employees statistics',
    icon: '📉'
  }
];

/**
 * Get all available query templates
 * @returns {Array} List of query templates
 */
function getQueryTemplates() {
  return QUERY_TEMPLATES.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    icon: t.icon,
    // Don't expose the actual query - only the template info
  }));
}

/**
 * Execute a template-based query
 * @param {string} templateId - The template ID to execute
 * @returns {Promise<Object>} Query result
 */
async function executeTemplate(templateId) {
  const template = QUERY_TEMPLATES.find(t => t.id === templateId);
  
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 EXECUTING TEMPLATE QUERY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Template ID:', templateId);
  console.log('Title:', template.title);
  console.log('Query:', template.query);
  console.log('───────────────────────────────────────────────────────────');

  try {
    const result = await executeHRDatabaseQuery(template.query);
    console.log('✅ Template query executed successfully');
    console.log('═══════════════════════════════════════════════════════════');
    return result;
  } catch (error) {
    console.error('❌ Template execution error:', error.message);
    console.log('═══════════════════════════════════════════════════════════');
    throw error;
  }
}

/**
 * Validate a template ID
 * @param {string} templateId - Template ID to validate
 * @returns {boolean} Whether the template exists
 */
function isValidTemplate(templateId) {
  return QUERY_TEMPLATES.some(t => t.id === templateId);
}

module.exports = {
  QUERY_TEMPLATES,
  getQueryTemplates,
  executeTemplate,
  isValidTemplate,
};
