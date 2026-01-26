# 🚀 Docker Compose Deployment Guide for VM

This guide explains how to deploy the WinOnBoard application on a VM using Docker Compose.

## ✅ Prerequisites

- Docker & Docker Compose installed on your VM
- Your VM IP address (e.g., `3.145.152.128`)
- MongoDB connection string available
- All required environment variables configured

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

#### Backend (.env file)
Ensure the backend `.env` file has all required variables:
```env
NODE_ENV=production
PORT=8080
HOST=0.0.0.0
SINGLE_SERVICE=false

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123

# Azure OpenAI (if using AI features)
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2025-01-01-preview

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png

# For VM Deployment - Add your VM IP
ALLOWED_ORIGINS=http://<VM_IP>,http://<VM_IP>:3000,http://<VM_IP>:80
```

#### Frontend (.env.production file)
```env
REACT_APP_NODE_ENV=production
REACT_APP_API_URL=http://<VM_IP>:8080/api
```

**Replace `<VM_IP>` with your actual VM IP address (e.g., `3.145.152.128`)**

### 2. Docker Configuration

The `docker-compose.yml` has been updated with:
- ✅ Proper build contexts instead of pre-built images
- ✅ Health checks for backend service
- ✅ Proper dependency management
- ✅ Production environment settings

## 🚀 Deployment Steps

### Step 1: SSH into your VM
```bash
ssh user@<VM_IP>
```

### Step 2: Clone/Upload the project
```bash
cd /path/to/deployment
git clone <your-repo> winonboard_CAS
cd winonboard_CAS
```

### Step 3: Update Environment Variables

Create/Update the backend `.env` file:
```bash
# Edit backend/.env with your actual values
nano backend/.env
```

Create/Update the frontend `.env.production` file:
```bash
# Edit frontend/.env.production with your VM IP
nano frontend/.env.production
```

### Step 4: Build and Start Containers

```bash
# Build images and start services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Step 5: Verify Deployment

```bash
# Check backend health
curl http://localhost:8080/api/health

# Check frontend is running
curl http://localhost/

# Check container status
docker-compose ps

# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend
```

## 🔗 Access the Application

- **Frontend**: `http://<VM_IP>` (port 80)
- **Backend API**: `http://<VM_IP>:8080/api` (port 8080)
- **Login**: Use admin credentials from `.env` file

## 🐛 Troubleshooting

### Issue: 404 on favicon
✅ **Fixed** - Favicon link added to index.html

### Issue: API calls fail (404 on /api/auth/login)
**Solutions:**
1. Verify `ALLOWED_ORIGINS` in backend `.env` includes your VM IP
2. Check frontend `.env.production` has correct `REACT_APP_API_URL`
3. Check backend is running: `docker-compose logs backend`
4. Verify containers are connected: `docker network ls`

### Issue: Frontend can't reach backend
**Solutions:**
1. Check docker-compose network: `docker network inspect <network-name>`
2. Verify backend container is healthy: `docker-compose ps`
3. Test connectivity from frontend: `docker-compose exec frontend curl http://backend:8080/api/health`

### Issue: MongoDB connection error
**Solutions:**
1. Verify `MONGODB_URI` is correct in backend `.env`
2. Check MongoDB is accessible from your VM
3. Verify IP whitelisting in MongoDB Atlas if using cloud

### Issue: CORS errors
**Solutions:**
1. Add VM IP to `ALLOWED_ORIGINS` in backend `.env`:
   ```env
   ALLOWED_ORIGINS=http://<VM_IP>,http://<VM_IP>:80,http://<VM_IP>:3000
   ```
2. Redeploy: `docker-compose restart backend`

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 50 lines
docker-compose logs --tail=50
```

## 📊 Monitoring Commands

```bash
# Check container status
docker-compose ps

# Check resource usage
docker stats

# Check network connectivity
docker network inspect <network-name>

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 🛑 Stopping/Restarting

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Stop all services (keeps data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Completely reset (removes volumes)
docker-compose down -v
```

## 🔄 Redeployment (After Code Changes)

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up --build -d

# Or rebuild specific service
docker-compose up --build -d backend
```

## 📝 Important Notes

1. **Firewall**: Ensure ports 80 and 8080 are open on your VM
2. **SSL/HTTPS**: For production, use a reverse proxy (nginx/Apache) with SSL certificates
3. **Database**: MongoDB must be accessible from the VM (check IP whitelist)
4. **Environment Variables**: Keep `.env` files secure, never commit to Git
5. **Logs**: Always check logs when services don't work

## 🆘 Still Having Issues?

1. Check all logs: `docker-compose logs`
2. Verify network connectivity: `docker network inspect <network>`
3. Test API directly: `curl http://<VM_IP>:8080/api/health`
4. Verify `.env` files have all required variables
5. Ensure MongoDB is accessible and has correct connection string
