/**
 * Natural Language Query Parser for HR Database
 * Converts natural language to database queries
 */

const {
  countDocuments,
  findDocuments,
  getCollectionStats,
} = require('./secureDbQuery');

// Field mappings - maps natural language terms to actual database fields
const FIELD_MAPPINGS = {
  // Candidate fields
  'candidates': 'Candidates',
  'applicants': 'Candidates',
  'name': 'name',
  'email': 'email',
  'phone': 'phone',
  'position': 'position',
  'department': 'department',
  'job': 'position',
  'role': 'position',
  'status': 'status',
  'applied': 'appliedDate',
  'applied date': 'appliedDate',
  'application date': 'appliedDate',
  'experience': 'experience',
  'qualification': 'qualification',
  'location': 'location',

  // Status values
  'accepted': 'Accepted',
  'accepted offer': 'Accepted',
  'accepted offers': 'Accepted',
  'rejected': 'Rejected',
  'pending': 'Pending',
  'under review': 'Under Review',
  'interview': 'Interview',
  'active': 'Active',
  'inactive': 'Inactive',

  // Employee fields
  'employees': 'Employees',
  'staff': 'Employees',
  'team members': 'Employees',
  'firstname': 'firstName',
  'first name': 'firstName',
  'lastname': 'lastName',
  'last name': 'lastName',
  'join date': 'joinDate',
  'joined': 'joinDate',
  'reporting manager': 'reportingManager',
  'manager': 'reportingManager',
  'office location': 'officeLocation',
  'office': 'officeLocation',

  // Onboarding fields
  'onboarding': 'OnboardingSubmissions',
  'onboarding submissions': 'OnboardingSubmissions',
  'onboarding status': 'OnboardingSubmissions',
  'join date': 'joinDate',
  'submitted': 'submittedAt',
  'submitted at': 'submittedAt',
  'completed': 'completedAt',
  'completed at': 'completedAt',
  'current step': 'currentStep',
  'step': 'currentStep',
};

/**
 * Normalize text for matching
 */
function normalize(text) {
  return text.toLowerCase().trim();
}

/**
 * Find matching field from natural language
 */
function findMatchingField(text) {
  const normalized = normalize(text);
  
  // Exact match first
  if (FIELD_MAPPINGS[normalized]) {
    return FIELD_MAPPINGS[normalized];
  }

  // Partial match
  for (const [key, value] of Object.entries(FIELD_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

/**
 * Find collection from query
 */
function detectCollection(query) {
  const normalized = normalize(query);

  if (
    normalized.includes('candidate') ||
    normalized.includes('applicant') ||
    normalized.includes('applied') ||
    normalized.includes('job application')
  ) {
    return 'Candidates';
  }

  if (
    normalized.includes('employee') ||
    normalized.includes('staff') ||
    normalized.includes('team member') ||
    normalized.includes('department') ||
    normalized.includes('manager')
  ) {
    return 'Employees';
  }

  if (
    normalized.includes('onboarding') ||
    normalized.includes('new joiner') ||
    normalized.includes('onboard')
  ) {
    return 'OnboardingSubmissions';
  }

  // Default to Candidates if unclear
  return 'Candidates';
}

/**
 * Detect query type (count, find, stats)
 */
function detectQueryType(query) {
  const normalized = normalize(query);

  if (
    normalized.includes('how many') ||
    normalized.includes('total') ||
    normalized.includes('count') ||
    normalized.includes('number of')
  ) {
    return 'count';
  }

  if (
    normalized.includes('statistics') ||
    normalized.includes('stats') ||
    normalized.includes('breakdown') ||
    normalized.includes('summary')
  ) {
    return 'stats';
  }

  // Default to find
  return 'find';
}

/**
 * Extract filters from query
 */
function extractFilters(query) {
  const filters = {};
  const normalized = normalize(query);

  // Status filters
  if (normalized.includes('accepted')) {
    filters.status = 'Accepted';
  } else if (normalized.includes('rejected')) {
    filters.status = 'Rejected';
  } else if (normalized.includes('pending')) {
    filters.status = 'Pending';
  } else if (normalized.includes('under review')) {
    filters.status = 'Under Review';
  } else if (normalized.includes('interview')) {
    filters.status = 'Interview';
  }

  // Department filters
  if (
    normalized.includes('engineering') ||
    normalized.includes('engineer')
  ) {
    filters.department = 'Engineering';
  } else if (
    normalized.includes('hr') ||
    normalized.includes('human resources')
  ) {
    filters.department = 'HR';
  } else if (
    normalized.includes('sales') ||
    normalized.includes('sales')
  ) {
    filters.department = 'Sales';
  } else if (
    normalized.includes('marketing')
  ) {
    filters.department = 'Marketing';
  }

  return filters;
}

/**
 * Parse natural language query and execute
 */
async function parseAndExecuteQuery(userMessage, collection = null) {
  try {
    // Detect collection if not provided
    if (!collection) {
      collection = detectCollection(userMessage);
    }

    // Detect query type
    const queryType = detectQueryType(userMessage);

    // Extract filters
    const filters = extractFilters(userMessage);

    console.log('');
    console.log('━'.repeat(60));
    console.log('📊 NATURAL LANGUAGE QUERY PARSER');
    console.log('━'.repeat(60));
    console.log('Query:', userMessage);
    console.log('Detected Collection:', collection);
    console.log('Query Type:', queryType);
    console.log('Filters:', Object.keys(filters).length > 0 ? filters : 'None');
    console.log('━'.repeat(60));
    console.log('');

    // Execute based on query type
    let result;

    if (queryType === 'count') {
      result = await countDocuments(collection, filters);
      return formatCountResult(result);
    } else if (queryType === 'stats') {
      result = await getCollectionStats(collection);
      return formatStatsResult(result);
    } else {
      // find
      result = await findDocuments(
        collection,
        filters,
        { limit: 10 }
      );
      return formatFindResult(result);
    }
  } catch (error) {
    throw new Error(`Failed to parse query: ${error.message}`);
  }
}

/**
 * Format count result for display
 */
function formatCountResult(result) {
  const filterStr =
    Object.keys(result.filters).length > 0
      ? ` with filters: ${JSON.stringify(result.filters)}`
      : '';

  return `Found **${result.count}** ${result.collection}${filterStr}.`;
}

/**
 * Format find result for display
 */
function formatFindResult(result) {
  if (result.count === 0) {
    return `No ${result.collection} found matching your criteria.`;
  }

  let response = `Found **${result.count}** ${result.collection}:\n\n`;

  result.data.forEach((item, index) => {
    response += `**${index + 1}. `;
    
    // Show first few fields
    if (item.name) response += `${item.name}`;
    if (item.firstName) response += `${item.firstName} ${item.lastName || ''}`;
    if (item.email) response += ` (${item.email})`;
    if (item.position) response += ` - ${item.position}`;
    if (item.status) response += ` - ${item.status}`;
    
    response += '**\n';
  });

  return response;
}

/**
 * Format stats result for display
 */
function formatStatsResult(result) {
  let response = `**Statistics for ${result.collection}:**\n\n`;
  response += `- **Total**: ${result.statistics.total}\n`;

  if (result.statistics.byStatus) {
    response += '\n**By Status:**\n';
    result.statistics.byStatus.forEach((stat) => {
      response += `  - ${stat._id}: ${stat.count}\n`;
    });
  }

  if (result.statistics.byDepartment) {
    response += '\n**By Department:**\n';
    result.statistics.byDepartment.forEach((stat) => {
      response += `  - ${stat._id}: ${stat.count}\n`;
    });
  }

  return response;
}

module.exports = {
  parseAndExecuteQuery,
  detectCollection,
  detectQueryType,
  extractFilters,
  findMatchingField,
  FIELD_MAPPINGS,
};
