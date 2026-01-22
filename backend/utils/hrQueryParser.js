/**
 * Intelligent Database Query Parser for HR Chatbot
 * Parses natural language requests and executes secure database queries
 */

const {
  countDocuments,
  findDocuments,
  getCollectionStats,
  getCollectionSummary,
} = require('./secureDbQuery');

/**
 * Parse HR user's natural language query and execute it
 * @param {string} userMessage - User's question/request
 * @returns {Promise<Object>} Query result or null if not a database query
 */
async function executeHRDatabaseQuery(userMessage) {
  try {
    const message = userMessage.toLowerCase().trim();

    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('🔍 DATABASE QUERY ANALYSIS');
    console.log('═══════════════════════════════════════════════');
    console.log('Message:', userMessage);
    console.log('───────────────────────────────────────────────');

    // PRIMARY KEYWORDS - these REQUIRE database query
    const strictCountKeywords = ['how many', 'count ', 'total ', 'total number', 'number of'];
    const strictFindKeywords = ['show ', 'show me', 'find ', 'list ', 'get me', 'get all', 'retrieve', 'display'];
    const strictStatsKeywords = ['statistics', 'stats', 'breakdown', 'summary'];
    const strictSchemaKeywords = ['fields', 'columns', 'available', 'schema'];
    
    // Collection-specific keywords - combination of these trigger implicit queries
    const collectionKeywords = {
      'Candidates': ['candidate', 'candidates', 'applicant', 'applicants', 'offers', 'offer'],
      'Employees': ['employee', 'employees', 'staff', 'team member'],
      'OnboardingSubmissions': ['onboarding', 'new joiner', 'new joiners'],
      'Users': ['users', 'accounts'],
    };

    // Status keywords - when combined with collection, they trigger implicit queries
    const statusKeywords = [
      'active', 'inactive', 'accepted', 'rejected', 'pending', 'in progress',
      'completed', 'under review', 'interview', 'offer'
    ];
    
    // Department keywords for employees
    const departmentKeywords = [
      'engineering', 'sales', 'hr', 'marketing', 'finance', 'operations'
    ];

    // Check if message contains STRICT database query keywords
    const isStrictCountQuery = strictCountKeywords.some(kw => message.includes(kw));
    const isStrictFindQuery = strictFindKeywords.some(kw => message.includes(kw));
    const isStrictStatsQuery = strictStatsKeywords.some(kw => message.includes(kw));
    const isStrictSchemaQuery = strictSchemaKeywords.some(kw => message.includes(kw));
    
    // Check for collection names
    const collectionMatch = Object.entries(collectionKeywords).find(([_, aliases]) => 
      aliases.some(alias => message.includes(alias))
    );
    const hasCollection = !!collectionMatch;
    const detectedCollection = collectionMatch ? collectionMatch[0] : null;
    
    // Check for status or department keywords
    const hasStatusKeyword = statusKeywords.some(kw => message.includes(kw));
    const hasDepartmentKeyword = departmentKeywords.some(kw => message.includes(kw));
    
    // IMPLICIT QUERY: if message has [status/department] + [collection], it's a DB query
    const isImplicitQuery = (hasStatusKeyword || hasDepartmentKeyword) && hasCollection;

    console.log('Detection Results:');
    console.log('  strictCountQuery:', isStrictCountQuery);
    console.log('  strictFindQuery:', isStrictFindQuery);
    console.log('  strictStatsQuery:', isStrictStatsQuery);
    console.log('  implicitQuery:', isImplicitQuery, `(status:${hasStatusKeyword}, collection:${hasCollection})`);
    console.log('  detectedCollection:', detectedCollection);

    // STRICT: Only proceed if there's a clear database query indicator
    const isDatabaseQuery = isStrictCountQuery || isStrictFindQuery || isStrictStatsQuery || isStrictSchemaQuery || isImplicitQuery;
    
    if (!isDatabaseQuery) {
      console.log('❌ Not a database query - missing clear indicators');
      console.log('═══════════════════════════════════════════════');
      return null;
    }

    console.log('✅ Database query confirmed - executing...');

    // Schema query - return available collections
    if (isStrictSchemaQuery) {
      console.log('📋 Schema query detected');
      const schema = await getCollectionSummary();
      const result = {
        type: 'schema',
        result: schema,
        message: 'Here are the available collections and fields:',
      };
      console.log('✅ Schema query executed');
      console.log('═══════════════════════════════════════════════');
      return result;
    }

    // Extract collection name from message
    const collection = parseCollectionName(message);
    if (!collection) {
      console.log('⚠️  Could not identify collection - returning null to avoid hallucination');
      console.log('═══════════════════════════════════════════════');
      return null; 
    }

    console.log('📁 Collection:', collection);

    // Stats query
    if (isStrictStatsQuery) {
      console.log('📊 Stats query detected');
      const result = await getCollectionStats(collection);
      const response = {
        type: 'stats',
        collection: collection,
        result: result.statistics,
        message: `Here are the statistics for ${collection}:`,
      };
      console.log('✅ Stats query executed');
      console.log('═══════════════════════════════════════════════');
      return response;
    }

    // Parse filters from message
    const filters = parseFilters(message, collection);
    console.log('🔎 Filters:', JSON.stringify(filters));

    // Count query (highest priority - most specific)
    if (isStrictCountQuery) {
      console.log('🔢 Count query detected');
      const result = await countDocuments(collection, filters);
      const response = {
        type: 'count',
        collection: collection,
        count: result.count,
        filters: filters,
      };
      console.log(`✅ Count query executed - Found: ${result.count}`);
      console.log('═══════════════════════════════════════════════');
      return response;
    }

    // Find query (for explicit "show/list/find" or implicit queries)
    if (isStrictFindQuery || isImplicitQuery) {
      console.log('📋 Find query detected (or implicit)');
      const result = await findDocuments(collection, filters, { limit: 10 });
      const response = {
        type: 'find',
        collection: collection,
        count: result.count,
        data: result.data,
        filters: filters,
      };
      console.log(`✅ Find query executed - Found: ${result.count} records`);
      console.log('═══════════════════════════════════════════════');
      return response;
    }

    console.log('❌ No matching query type');
    console.log('═══════════════════════════════════════════════');
    return null;
  } catch (error) {
    console.error('❌ Database Query Error:', error.message);
    console.log('═══════════════════════════════════════════════');
    throw error;
  }
}

/**
 * Parse collection name from user message
 * @param {string} message - User message (lowercase)
 * @returns {string|null} Collection name or null
 */
function parseCollectionName(message) {
  const collectionAliases = {
    'Candidates': ['candidate', 'candidates', 'applicants', 'applicant'],
    'Employees': ['employee', 'employees', 'staff', 'team members'],
    'OnboardingSubmissions': ['onboarding', 'onboarding submissions', 'new joiner', 'new joiners'],
    'Users': ['users', 'accounts', 'user accounts'],
  };

  for (const [collection, aliases] of Object.entries(collectionAliases)) {
    for (const alias of aliases) {
      if (message.includes(alias)) {        console.log(`  ✓ Collection match: "${alias}" → ${collection}`);        return collection;
      }
    }
  }

  return null;
}

/**
 * Parse filter criteria from user message
 * @param {string} message - User message (lowercase)
 * @param {string} collection - Collection name
 * @returns {Object} Filters object
 */
function parseFilters(message, collection) {
  const filters = {};

  // Status mappings for Candidates collection (uses offerStatus field with UPPERCASE values)
  const candidateStatusMappings = {
    'accepted offer': 'ACCEPTED',
    'accepted offers': 'ACCEPTED',
    'offer accepted': 'ACCEPTED',
    'accepted': 'ACCEPTED',
    'reject': 'REJECTED',
    'rejected': 'REJECTED',
    'rejected offer': 'REJECTED',
    'rejected offers': 'REJECTED',
    'pending': 'PENDING',
    'pending offer': 'PENDING',
    'under review': 'UNDER_REVIEW',
    'in review': 'UNDER_REVIEW',
  };

  // Status mappings for other collections (mixed case)
  const generalStatusMappings = {
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'pending': 'Pending',
    'under review': 'Under Review',
    'in review': 'Under Review',
    'in progress': 'In Progress',
    'completed': 'Completed',
    'active': 'Active',
    'inactive': 'Inactive',
  };

  // For Candidates, check offerStatus with specific mappings (UPPERCASE!)
  if (collection === 'Candidates') {
    for (const [term, statusValue] of Object.entries(candidateStatusMappings)) {
      if (message.includes(term)) {
        filters.offerStatus = statusValue;
        console.log(`  ✓ Detected Candidate offer status: "${term}" → ${statusValue}`);
        break;
      }
    }
  } else {
    // For other collections, use status field
    for (const [term, statusValue] of Object.entries(generalStatusMappings)) {
      if (message.includes(term)) {
        filters.status = statusValue;
        console.log(`  ✓ Detected status filter: "${term}" → ${statusValue}`);
        break;
      }
    }
  }

  // Department mappings
  const departmentMappings = {
    'engineering': 'Engineering',
    'engineer': 'Engineering',
    'hr': 'HR',
    'human resources': 'HR',
    'sales': 'Sales',
    'marketing': 'Marketing',
    'finance': 'Finance',
    'operations': 'Operations',
  };

  // Check for department values (for Employees collection)
  if (collection === 'Employees') {
    for (const [term, deptValue] of Object.entries(departmentMappings)) {
      if (message.includes(term)) {
        filters.department = deptValue;
        console.log(`  ✓ Detected department filter: "${term}" → ${deptValue}`);
        break;
      }
    }
  }

  return filters;
}

/**
 * Format database query result for chatbot response
 * @param {Object} queryResult - Result from executeHRDatabaseQuery
 * @returns {string} Formatted response
 */
function formatQueryResult(queryResult) {
  if (!queryResult) {
    return null;
  }

  if (queryResult.type === 'error') {
    return `❌ Database Error: ${queryResult.error}`;
  }

  let response = '';

  // COUNT QUERY
  if (queryResult.type === 'count') {
    const collection = queryResult.collection;
    const count = queryResult.count;
    const filters = queryResult.filters;
    
    // Build filter description
    let filterDesc = '';
    if (Object.keys(filters).length > 0) {
      const filterParts = [];
      if (filters.offerStatus) filterParts.push(`Offer: ${filters.offerStatus}`);
      if (filters.status) filterParts.push(`Status: ${filters.status}`);
      if (filters.department) filterParts.push(`Department: ${filters.department}`);
      filterDesc = ` • ${filterParts.join(' • ')}`;
    }
    
    // Better count response with emoji
    const collectionEmojis = {
      'Candidates': '👥',
      'Employees': '👔',
      'Users': '🔐',
      'OnboardingSubmissions': '📋'
    };
    const emoji = collectionEmojis[collection] || '📊';
    
    response = `${emoji} **${count}** ${collection.toLowerCase()}`;
    if (filterDesc) response += `\n${filterDesc}`;
    return response;
  }

  // FIND QUERY
  if (queryResult.type === 'find' && queryResult.data) {
    const collection = queryResult.collection;
    const data = queryResult.data;
    const count = queryResult.count;
    
    if (count === 0) {
      const emoji = {
        'Candidates': '👥',
        'Employees': '👔',
        'Users': '🔐',
        'OnboardingSubmissions': '📋'
      }[collection] || '📊';
      response = `${emoji} No ${collection.toLowerCase()} found matching your criteria.`;
      return response;
    }

    // Header with count
    const collectionEmojis = {
      'Candidates': '👥',
      'Employees': '👔',
      'Users': '🔐',
      'OnboardingSubmissions': '📋'
    };
    const emoji = collectionEmojis[collection] || '📊';
    response = `${emoji} **${count}** ${collection.toLowerCase()} found:\n`;
    response += `${'─'.repeat(50)}\n\n`;
    
    // Format each record with better structure
    data.forEach((item, index) => {
      response += `${index + 1}. `;
      const parts = [];
      
      // Name fields - check all variations
      if (item.fullName) parts.push(`👤 ${item.fullName}`);
      else if (item.firstName && item.lastName) parts.push(`👤 ${item.firstName} ${item.lastName}`);
      else if (item.name) parts.push(`👤 ${item.name}`);
      else if (item.candidateName) parts.push(`👤 ${item.candidateName}`);
      
      // Email
      if (item.email) parts.push(`📧 ${item.email}`);
      
      // Position/Role
      if (item.position) parts.push(`💼 ${item.position}`);
      
      // Department
      if (item.department) parts.push(`🏢 ${item.department}`);
      
      // Status indicators with emojis
      if (item.offerStatus) {
        const offerEmoji = {
          'ACCEPTED': '✅',
          'PENDING': '⏳',
          'REJECTED': '❌'
        }[item.offerStatus] || '📌';
        parts.push(`${offerEmoji} ${item.offerStatus}`);
      }
      if (item.status && !item.offerStatus) {
        const statusEmoji = {
          'ACTIVE': '✅',
          'INACTIVE': '❌',
          'PASS_ACCEPTED': '✅'
        }[item.status] || '📌';
        parts.push(`${statusEmoji} ${item.status}`);
      }
      if (item.currentStep) parts.push(`📍 ${item.currentStep}`);
      
      response += parts.join('\n   ');
      response += '\n\n';
    });

    response += `${'─'.repeat(50)}`;
    return response;
  }

  // STATS QUERY
  if (queryResult.type === 'stats') {
    const collectionEmojis = {
      'Candidates': '👥',
      'Employees': '👔',
      'Users': '🔐',
      'OnboardingSubmissions': '📋'
    };
    const emoji = collectionEmojis[queryResult.collection] || '📊';
    
    response = `${emoji} **${queryResult.collection} Statistics**\n`;
    response += `${'─'.repeat(40)}\n`;
    response += `📊 Total: **${queryResult.result.total}**\n\n`;
    
    // For Candidates, show offerStatus stats
    if (queryResult.result.byOfferStatus && queryResult.result.byOfferStatus.length > 0) {
      response += '**By Offer Status:**\n';
      queryResult.result.byOfferStatus.forEach(stat => {
        const status = stat._id || 'Not Set';
        const statusEmoji = {
          'ACCEPTED': '✅',
          'PENDING': '⏳',
          'REJECTED': '❌'
        }[status] || '📌';
        response += `  ${statusEmoji} ${status}: **${stat.count}**\n`;
      });
      response += '\n';
    }
    
    // Show status stats
    if (queryResult.result.byStatus && queryResult.result.byStatus.length > 0) {
      response += '**By Status:**\n';
      queryResult.result.byStatus.forEach(stat => {
        const status = stat._id || 'Not Set';
        const statusEmoji = {
          'ACTIVE': '✅',
          'INACTIVE': '❌',
          'PASS_ACCEPTED': '✅'
        }[status] || '📌';
        response += `  ${statusEmoji} ${status}: **${stat.count}**\n`;
      });
      response += '\n';
    }
    
    // Show department stats
    if (queryResult.result.byDepartment && queryResult.result.byDepartment.length > 0) {
      response += '**By Department:**\n';
      queryResult.result.byDepartment.forEach(stat => {
        const dept = stat._id || 'Not Set';
        response += `  🏢 ${dept}: **${stat.count}**\n`;
      });
    }

    response += `${'─'.repeat(40)}`;
    return response;
  }

  // SCHEMA QUERY
  if (queryResult.type === 'schema') {
    response = '**📁 Available Collections**\n';
    response += `${'─'.repeat(40)}\n\n`;
    for (const [name, info] of Object.entries(queryResult.result)) {
      const emoji = {
        'Candidates': '👥',
        'Employees': '👔',
        'Users': '🔐',
        'OnboardingSubmissions': '📋'
      }[name] || '📊';
      response += `${emoji} **${name}**\n`;
      response += `   ${info.description}\n`;
      response += `   Fields: ${info.availableFields.slice(0, 5).join(', ')}\n\n`;
    }
    response += `${'─'.repeat(40)}`;
    return response;
  }

  return '❓ Unable to process query result.';
}

module.exports = {
  executeHRDatabaseQuery,
  formatQueryResult,
  parseCollectionName,
  parseFilters,
};
