const multer = require('multer');

// Configure memory storage for files to be stored in database
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed!'));
  }
};

// Upload middleware for database storage
const uploadToDatabase = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * Helper function to prepare document object for database storage
 * Converts file buffer to base64 string for reliable storage
 * @param {Object} file - multer file object
 * @returns {Object} - document object with base64 data, content type, and filename
 */
const prepareDocumentForDB = (file) => {
  if (!file) return null;
  
  return {
    data: file.buffer.toString('base64'),
    contentType: file.mimetype,
    filename: file.originalname,
    uploadedAt: new Date()
  };
};

/**
 * Helper function to prepare multiple documents for database storage
 * Converts file buffers to base64 strings for reliable storage
 * @param {Array} files - array of multer file objects
 * @returns {Array} - array of document objects
 */
const prepareDocumentsForDB = (files) => {
  if (!files || files.length === 0) return [];
  
  return files.map(file => ({
    data: file.buffer.toString('base64'),
    contentType: file.mimetype,
    filename: file.originalname,
    uploadedAt: new Date()
  }));
};

module.exports = {
  uploadToDatabase,
  prepareDocumentForDB,
  prepareDocumentsForDB
};
