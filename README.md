# WinWire Ignite - Project Structure

Welcome to the WinWire Ignite project! This document explains the organized folder structure.

## 📁 Root Directory Structure

```
Ignite/
├── backend/              # Express.js backend server
├── frontend/             # React.js frontend application
├── docs/                 # Documentation, guides, and resources
├── scripts/              # Setup and utility scripts
├── tests/                # Test files and utilities
├── config/               # Configuration file templates
└── README.md             # This file
```

## 📚 Folder Descriptions

### `/backend`
Node.js/Express backend server for the onboarding system.

**Key Directories:**
- `agents/` - AI agent implementations
- `models/` - MongoDB data models (Candidate, Employee, User, OnboardingSubmission)
- `routes/` - API route handlers
- `middleware/` - Express middleware (authentication, etc.)
- `utils/` - Utility functions (email, chatbot, file upload, JWT, etc.)
- `assets/` - Static assets
- `documents/` - Document handling

**Key Files:**
- `server.js` - Main Express server entry point
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (keep secure!)

**Start Backend:**
```bash
cd backend
npm install
npm run dev
```

---

### `/frontend`
React.js frontend application for user interfaces.

**Key Directories:**
- `src/components/` - React components
  - `Employee/` - Employee-specific components
  - `HR/` - HR dashboard and management components
- `src/utils/` - Frontend utilities (API calls, validation)
- `public/` - Static files

**Key Files:**
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (API URLs, etc.)

**Start Frontend:**
```bash
cd frontend
npm install
npm start
```

---

### `/docs`
All documentation, guides, and reference materials.

**Contents:**
- Setup guides (QUICKSTART.md, AGENT_QUICKSTART.md)
- Feature documentation (FEATURES.md)
- Testing guides (TESTING.md, TESTING_GUIDE.md)
- Email flow analysis (EMAIL_FLOW_ANALYSIS.md)
- Chatbot setup (CHATBOT_SETUP.md)
- Update summaries and checklists
- Company resources (PDFs, spreadsheets)

---

### `/scripts`
Automation and setup scripts.

**Contents:**
- `setup.bat` - Windows batch setup script
- `setup.ps1` - PowerShell setup script

---

### `/tests`
Test files and cleanup utilities.

**Backend Tests:**
- `test-azure-auth.js` - Test Azure OpenAI authentication
- `test-chatbot.js` - Test chatbot functionality
- `test-foundry-methods.js` - Test different Azure Foundry authentication methods
- `test-message.js` - Test message sending

**Utilities:**
- `checkdb.js` - Database integrity checker
- `cleanAll.js` - Full database cleanup
- `cleanup.js` - Selective cleanup
- `deleteAll.js` - Delete all data

---

### `/config`
Configuration templates and examples.

**Contents:**
- `.env.example.backend` - Backend environment variables template
- `.gitignore.backend` - Backend gitignore template

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- Azure OpenAI credentials

### Setup

1. **Clone and navigate:**
   ```bash
   cd Ignite
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Setup Frontend (in a new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 🤖 Features

- **Employee Onboarding** - Streamlined onboarding process
- **HR Dashboard** - Management and monitoring
- **WinWire Chatbot** - Azure OpenAI GPT-4o-mini integration
- **Email Notifications** - Automated email campaigns
- **Document Management** - File upload and storage
- **Authentication** - JWT-based security

---

## 📖 Documentation

For detailed information, see:
- `docs/QUICKSTART.md` - Getting started guide
- `docs/FEATURES.md` - Feature overview
- `docs/TESTING_GUIDE.md` - Testing instructions
- `docs/CHATBOT_SETUP.md` - Chatbot configuration

---

## 🧪 Testing

Run tests from the `/tests` directory:

```bash
# Test Azure authentication
node tests/test-azure-auth.js

# Test chatbot
node tests/test-chatbot.js

# Check database
node tests/checkdb.js

# Clean database
node tests/cleanAll.js
```

---

## 🛠️ Environment Variables

### Backend `.env` (in `/backend`)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/winwire_onboarding
JWT_SECRET=your_secret_key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2025-01-01-preview
```

### Frontend `.env` (in `/frontend`)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📝 Common Tasks

### Add a new API route
1. Create route file in `backend/routes/`
2. Add handlers using existing patterns
3. Register in `backend/server.js`

### Add a new React component
1. Create component in `frontend/src/components/`
2. Import and use in parent components
3. Add styling in `.css` file

### Update chatbot behavior
1. Edit system prompt in `backend/utils/chatbotService.js`
2. Test with `node tests/test-chatbot.js`
3. Restart backend server

### Add environment variables
1. Update `.env` file
2. Update `.env.example` for reference
3. Restart the server

---

## 🔐 Security Notes

- ⚠️ **Never commit `.env` files** - They contain sensitive credentials
- Keep API keys secure and rotate regularly
- Use `.env.example` as a template
- Always validate user input
- Enable HTTPS in production

---

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify all environment variables are set
- Check port 5000 is available

### Frontend 404 errors
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in `.env`
- Clear browser cache

### Chatbot not responding
- Test authentication: `node tests/test-azure-auth.js`
- Verify API key and endpoint in `.env`
- Check Azure quota limits

---

## 📞 Support

For issues or questions, refer to:
- `docs/TROUBLESHOOTING.md` (if available)
- Test files in `/tests` directory
- Documentation in `/docs` folder

---

**Last Updated:** December 20, 2025

