/**
 * Secure Database Query Handler for HR Personnel
 * Provides safe database access with field-level security
 * Filters out sensitive information automatically
 */

const User = require('../models/User.model');
const Employee = require('../models/Employee.model');
const Candidate = require('../models/Candidate.model');
const OnboardingSubmission = require('../models/OnboardingSubmission.model');

// Fields that should NEVER be exposed to HR (sensitive/confidential)
const FORBIDDEN_FIELDS = {
  password: 0,
  '__v': 0,
  'bankDetails': 0,
  'ssn': 0,
  'salary': 0,
  'bankAccountNumber': 0,
  'ifscCode': 0,
  'aadharNumber': 0,
  'panNumber': 0,
  'passportNumber': 0,
};

// Fields that HR CAN view per collection
const ALLOWED_COLLECTIONS = {
  'Candidates': {
    model: Candidate,
    allowedFields: {
      'fullName': 1,
      'name': 1,
      'email': 1,
      'phone': 1,
      'position': 1,
      'department': 1,
      'status': 1,
      'offerStatus': 1,
      'appliedDate': 1,
      'createdAt': 1,
      'experience': 1,
      'qualification': 1,
      'location': 1,
      'linkedin': 1,
      '_id': 1,
    },
    description: 'Candidate information (name, contact, position, status, offer status)',
  },
  'Employees': {
    model: Employee,
    allowedFields: {
      'userId': 1,
      'firstName': 1,
      'lastName': 1,
      'email': 1,
      'phone': 1,
      'department': 1,
      'position': 1,
      'joinDate': 1,
      'reportingManager': 1,
      'status': 1,
      'officeLocation': 1,
      'createdAt': 1,
      '_id': 1,
    },
    description: 'Employee information (name, department, position, status)',
  },
  'Users': {
    model: User,
    allowedFields: {
      'email': 1,
      'name': 1,
      'role': 1,
      'status': 1,
      'createdAt': 1,
      '_id': 1,
    },
    description: 'User accounts (email, name, role, status only)',
  },
  'OnboardingSubmissions': {
    model: OnboardingSubmission,
    allowedFields: {
      'candidateId': 1,
      'candidateName': 1,
      'email': 1,
      'status': 1,
      'joinDate': 1,
      'submittedAt': 1,
      'completedAt': 1,
      'currentStep': 1,
      'createdAt': 1,
      '_id': 1,
    },
    description: 'Onboarding status (progress, dates, current step)',
  },
};

/**
 * Get collection summary - list available collections and fields
 * @returns {Object} Available collections and fields
 */
async function getCollectionSummary() {
  const summary = {};
  
  for (const [collectionName, config] of Object.entries(ALLOWED_COLLECTIONS)) {
    summary[collectionName] = {
      description: config.description,
      availableFields: Object.keys(config.allowedFields),
    };
  }
  
  return summary;
}

/**
 * Count documents in a collection
 * @param {string} collectionName - Name of collection (Candidates, Employees, Users, OnboardingSubmissions)
 * @param {Object} filters - Query filters (e.g., {status: 'active'})
 * @returns {Promise<Object>} Count and metadata
 */
async function countDocuments(collectionName, filters = {}) {
  try {
    const collection = ALLOWED_COLLECTIONS[collectionName];
    
    if (!collection) {
      throw new Error(
        `Collection "${collectionName}" not found. Available: ${Object.keys(ALLOWED_COLLECTIONS).join(', ')}`
      );
    }

    // Validate filter fields
    validateFilterFields(collectionName, filters);

    const count = await collection.model.countDocuments(filters);
    
    console.log(`📊 Query: COUNT from ${collectionName} with filters:`, filters);
    console.log(`📊 Result: ${count} documents found`);

    return {
      success: true,
      collection: collectionName,
      count: count,
      filters: filters,
      timestamp: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to count documents: ${error.message}`);
  }
}

/**
 * Find documents with allowed fields only
 * @param {string} collectionName - Name of collection
 * @param {Object} filters - Query filters
 * @param {Object} options - Query options (limit, skip, sort)
 * @returns {Promise<Array>} Documents with only allowed fields
 */
async function findDocuments(collectionName, filters = {}, options = {}) {
  try {
    const collection = ALLOWED_COLLECTIONS[collectionName];
    
    if (!collection) {
      throw new Error(
        `Collection "${collectionName}" not found. Available: ${Object.keys(ALLOWED_COLLECTIONS).join(', ')}`
      );
    }

    // Validate filter fields
    validateFilterFields(collectionName, filters);

    // Build query
    let query = collection.model.find(filters);

    // Only select allowed fields
    query = query.select(collection.allowedFields);

    // Apply options
    if (options.limit) query = query.limit(Math.min(options.limit, 100)); // Max 100
    if (options.skip) query = query.skip(Math.min(options.skip, 10000)); // Max 10000
    if (options.sort) query = query.sort(options.sort);

    const documents = await query.lean().exec();

    console.log(`📊 Query: FIND from ${collectionName}`);
    console.log(`📊 Filters:`, filters);
    console.log(`📊 Result: ${documents.length} documents found`);

    return {
      success: true,
      collection: collectionName,
      count: documents.length,
      data: documents,
      filters: filters,
      timestamp: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to find documents: ${error.message}`);
  }
}

/**
 * Get statistics about a collection
 * @param {string} collectionName - Name of collection
 * @returns {Promise<Object>} Statistics
 */
async function getCollectionStats(collectionName) {
  try {
    const collection = ALLOWED_COLLECTIONS[collectionName];
    
    if (!collection) {
      throw new Error(`Collection "${collectionName}" not found`);
    }

    const total = await collection.model.countDocuments();
    
    // Get basic aggregation stats for specific collections
    let stats = { total };

    if (collectionName === 'Candidates') {
      const byOfferStatus = await collection.model.aggregate([
        { $group: { _id: '$offerStatus', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      stats.byOfferStatus = byOfferStatus;
      
      // Also get by status if available
      const byStatus = await collection.model.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      if (byStatus && byStatus.length > 0 && byStatus[0]._id !== null) {
        stats.byStatus = byStatus;
      }
    }

    if (collectionName === 'Employees') {
      const byDepartment = await collection.model.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]);
      stats.byDepartment = byDepartment;
    }

    if (collectionName === 'OnboardingSubmissions') {
      const byStatus = await collection.model.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      stats.byStatus = byStatus;
    }

    console.log(`📊 Stats generated for ${collectionName}`);

    return {
      success: true,
      collection: collectionName,
      statistics: stats,
      timestamp: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }
}

/**
 * Validate that filter fields are allowed (not sensitive)
 * @param {string} collectionName - Collection name
 * @param {Object} filters - Filters object
 * @throws {Error} If forbidden field is used
 */
function validateFilterFields(collectionName, filters) {
  const forbiddenKeys = Object.keys(FORBIDDEN_FIELDS);
  const filterKeys = Object.keys(filters);
  
  const violatingFields = filterKeys.filter(key => forbiddenKeys.includes(key));
  
  if (violatingFields.length > 0) {
    throw new Error(
      `Cannot filter by sensitive fields: ${violatingFields.join(', ')}. ` +
      `Allowed fields for ${collectionName}: ${Object.keys(ALLOWED_COLLECTIONS[collectionName]?.allowedFields || {}).join(', ')}`
    );
  }
}

/**
 * Log database access for audit trail
 * @param {string} userId - HR user ID
 * @param {string} queryType - Type of query (COUNT, FIND, STATS)
 * @param {string} collectionName - Collection accessed
 * @param {Object} details - Query details
 */
function logDatabaseAccess(userId, queryType, collectionName, details) {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('📋 HR DATABASE ACCESS LOG');
  console.log('═══════════════════════════════════════════════');
  console.log('User ID:', userId);
  console.log('Query Type:', queryType);
  console.log('Collection:', collectionName);
  console.log('Timestamp:', new Date().toISOString());
  console.log('Details:', JSON.stringify(details, null, 2));
  console.log('═══════════════════════════════════════════════');
  console.log('');
}

module.exports = {
  getCollectionSummary,
  countDocuments,
  findDocuments,
  getCollectionStats,
  validateFilterFields,
  logDatabaseAccess,
  ALLOWED_COLLECTIONS,
  FORBIDDEN_FIELDS,
};
