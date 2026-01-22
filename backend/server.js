const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const candidateRoutes = require('./routes/candidate.routes');
const onboardingRoutes = require('./routes/onboarding.routes');
const employeeRoutes = require('./routes/employee.routes');
const adminRoutes = require('./routes/admin.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const hrDatabaseRoutes = require('./routes/hrDatabase.routes');
const promptsRoutes = require('./routes/prompts.routes');
const learningRoutes = require('./routes/learning.routes');

// Import seeder
const seedAdmin = require('./utils/seedAdmin');

const app = express();

const isSingleService = 
  process.env.SINGLE_SERVICE === 'true' || 
  process.env.NODE_ENV === 'production';

console.log(`🔍 Deployment Mode: ${isSingleService ? '🔗 SINGLE SERVICE (Frontend+Backend)' : '⚡ SEPARATE SERVICES'}`);

// Middleware - CORS Configuration
if (!isSingleService) {
  // Separate services: Allow specific frontend origin
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5173',  
        'http://127.0.0.1:5173',
        'https://winhronboard.azurewebsites.net'
      ];
  
  console.log('✅ CORS enabled for origins:', allowedOrigins);
  
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
} else {
  // Single service: Allow same-origin requests only
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests from Azure App Service (both with and without origin header)
      callback(null, true);
    },
    credentials: true
  }));
  console.log('✅ CORS configured for single-service deployment (Azure App Service)');
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploads, documents, assets)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/documents', express.static(path.join(__dirname, 'documents')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    // Seed admin account
    await seedAdmin();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/hr-database', hrDatabaseRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/learning', learningRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve React build for single service deployment
// This must come AFTER all /api routes but BEFORE the 404 catch-all
if (isSingleService) {
  const buildPath = path.join(__dirname, '../frontend/build');
  
  // Check if build exists
  if (fs.existsSync(buildPath)) {
    console.log('📦 Serving React frontend from:', buildPath);
    
    // Serve static files from React build
    app.use(express.static(buildPath, {
      maxAge: '1d',
      etag: false
    }));
    
    // SPA routing - all non-API routes serve index.html
    app.get('*', (req, res) => {
      // Don't serve index.html for API routes that might 404
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({
          success: false,
          message: 'API endpoint not found'
        });
      }
      
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    console.warn('⚠️ React build not found at', buildPath);
    console.warn('📋 To build frontend, run: cd frontend && npm run build');
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  if (isSingleService) {
    console.log('📱 Single Service Mode: Frontend + Backend on same port');
  } else {
    console.log('⚡ Separate Services Mode: Backend only');
  }
});
