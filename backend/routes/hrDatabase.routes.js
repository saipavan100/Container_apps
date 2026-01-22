const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getCollectionSummary,
  countDocuments,
  findDocuments,
  getCollectionStats,
  logDatabaseAccess,
} = require('../utils/secureDbQuery');

const router = express.Router();

/**
 * Middleware to check if user is HR
 */
const requireHR = (req, res, next) => {
  if (req.user.role !== 'HR') {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized: Only HR personnel can access database queries',
    });
  }
  next();
};

/**
 * GET /api/hr-database/schema
 * Get available collections and fields (non-confidential)
 */
router.get('/schema', protect, requireHR, async (req, res) => {
  try {
    const schema = await getCollectionSummary();
    
    res.json({
      success: true,
      message: 'Available collections and fields for HR',
      schema: schema,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/hr-database/count
 * Count documents in a collection with optional filters
 * Body: { collection: string, filters?: object }
 */
router.post('/count', protect, requireHR, async (req, res) => {
  try {
    const { collection, filters = {} } = req.body;

    if (!collection) {
      return res.status(400).json({
        success: false,
        error: 'Collection name is required',
      });
    }

    const result = await countDocuments(collection, filters);
    
    // Log access
    logDatabaseAccess(req.user._id, 'COUNT', collection, { filters });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/hr-database/find
 * Find documents with filters and pagination
 * Body: { collection: string, filters?: object, limit?: number, skip?: number, sort?: object }
 */
router.post('/find', protect, requireHR, async (req, res) => {
  try {
    const { collection, filters = {}, limit = 10, skip = 0, sort = {} } = req.body;

    if (!collection) {
      return res.status(400).json({
        success: false,
        error: 'Collection name is required',
      });
    }

    const result = await findDocuments(collection, filters, {
      limit: Math.min(limit, 100),
      skip: Math.min(skip, 10000),
      sort,
    });

    // Log access
    logDatabaseAccess(req.user._id, 'FIND', collection, { filters, limit, skip });

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/hr-database/stats
 * Get statistics about a collection
 * Body: { collection: string }
 */
router.post('/stats', protect, requireHR, async (req, res) => {
  try {
    const { collection } = req.body;

    if (!collection) {
      return res.status(400).json({
        success: false,
        error: 'Collection name is required',
      });
    }

    const result = await getCollectionStats(collection);

    // Log access
    logDatabaseAccess(req.user._id, 'STATS', collection, {});

    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
