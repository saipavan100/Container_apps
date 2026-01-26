# 🔍 Docker Compose Deployment Verification Checklist

## Pre-Deployment Checks

### 1. Code & Configuration ✅
- [x] Backend server.js CORS updated to accept environment variable
- [x] Frontend API configuration properly set up for environment variables
- [x] Docker-compose.yml updated with proper build contexts
- [x] Nginx configuration created for frontend
- [x] Production docker-compose file created
- [x] Environment files configured

### 2. Files Created/Updated

#### Configuration Files
- [x] `backend/.env.production` - Backend production environment
- [x] `frontend/.env.production` - Frontend production environment  
- [x] `frontend/nginx.conf` - Nginx reverse proxy configuration
- [x] `docker-compose.yml` - Updated for VM deployment
- [x] `docker-compose.production.yml` - Production-ready compose file

#### Documentation
- [x] `DEPLOYMENT.md` - Comprehensive deployment guide
- [x] `deploy.sh` - Bash deployment script
- [x] `deploy.ps1` - PowerShell deployment script

#### Code Changes
- [x] `backend/server.js` - Enhanced CORS with environment variable support
- [x] `frontend/Dockerfile` - Updated to include nginx.conf
- [x] `frontend/public/index.html` - Added favicon link
- [x] `frontend/public/favicon.ico` - Created basic favicon

## Setup Instructions for VM Deployment

### Step 1: Prepare VM
```bash
# SSH into VM
ssh user@<VM_IP>

# Install Docker & Docker Compose
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone Repository
```bash
cd /opt  # or your preferred directory
git clone <your-repo-url> winonboard_CAS
cd winonboard_CAS
```

### Step 3: Configure Environment Variables

**Option A: Manual Configuration**
```bash
# Edit backend configuration
nano backend/.env.production
# Update: ALLOWED_ORIGINS=http://<VM_IP>,http://<VM_IP>:80

# Edit frontend configuration  
nano frontend/.env.production
# Update: REACT_APP_API_URL=http://<VM_IP>:8080/api
```

**Option B: Using Deployment Script**
```bash
# Make scripts executable
chmod +x deploy.sh deploy.ps1

# Run deployment script (replace 3.145.152.128 with your VM IP)
./deploy.sh 3.145.152.128 production
# OR on Windows:
.\deploy.ps1 -VMIp "3.145.152.128" -Mode "production"
```

### Step 4: Start Services
```bash
# Using docker-compose directly
docker-compose -f docker-compose.production.yml up --build -d

# OR check logs in real-time
docker-compose -f docker-compose.production.yml up --build
```

### Step 5: Verify Deployment
```bash
# Check containers are running
docker-compose ps

# Check backend is healthy
curl http://localhost:8080/api/health

# Check frontend loads
curl http://localhost/

# View logs
docker-compose logs -f
```

## Environment Variable Requirements

### Backend (.env.production)
Required variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `ADMIN_EMAIL` & `ADMIN_PASSWORD` - Initial admin credentials
- `ALLOWED_ORIGINS` - Frontend URL(s) for CORS
- `EMAIL_*` - Email service configuration (for notifications)
- `AZURE_OPENAI_*` - If using AI features

### Frontend (.env.production)
Required variables:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_NODE_ENV` - Environment name

## Networking & Port Configuration

| Service | Port | Container | Host |
|---------|------|-----------|------|
| Frontend (Nginx) | 80 | 80 | 80 |
| Backend (Node.js) | 8080 | 8080 | 8080 |
| MongoDB | N/A | External/Cloud | External |

## Troubleshooting Checklist

### Frontend Shows 404 for favicon
- [x] Fixed: Added favicon link to index.html
- [x] Created favicon.ico file

### API Calls Return 404
- [ ] Verify backend container is running: `docker-compose ps`
- [ ] Check backend logs: `docker-compose logs backend`
- [ ] Verify `ALLOWED_ORIGINS` includes frontend URL
- [ ] Check `REACT_APP_API_URL` is correct
- [ ] Ensure port 8080 is accessible

### Frontend Can't Connect to Backend
- [ ] Verify containers are on same network: `docker network inspect`
- [ ] Check backend health: `docker-compose logs backend | grep "listening"`
- [ ] Test backend endpoint: `curl http://localhost:8080/api/health`
- [ ] Verify nginx proxy_pass is correct

### MongoDB Connection Issues
- [ ] Verify `MONGODB_URI` is correct
- [ ] Check MongoDB is accessible: `ping mongodb-host`
- [ ] Verify IP whitelisting in MongoDB Atlas
- [ ] Check connection string includes database name

### CORS Errors in Console
- [ ] Add VM IP to `ALLOWED_ORIGINS` in backend `.env.production`
- [ ] Restart backend: `docker-compose restart backend`
- [ ] Clear browser cache and restart

## Security Checklist

- [ ] `.env` files are in `.gitignore` (not committed)
- [ ] JWT_SECRET is changed from default
- [ ] Admin password is strong
- [ ] MongoDB has authentication enabled
- [ ] Only necessary ports are exposed (80, 8080)
- [ ] Consider using HTTPS/SSL in production

## Performance Checklist

- [ ] Nginx gzip compression enabled (in nginx.conf)
- [ ] Static file caching configured
- [ ] Health checks configured for auto-restart
- [ ] Container restart policy set to "always"
- [ ] Logging rotation configured

## Post-Deployment Steps

1. **Admin Login**
   - Access: `http://<VM_IP>`
   - Use credentials from backend `.env.production`

2. **Database Seed**
   - Admin account is auto-created on first run
   - Check backend logs: `docker-compose logs backend | grep "seed"`

3. **Monitoring**
   ```bash
   # Watch container stats
   docker stats
   
   # Monitor logs continuously
   docker-compose logs -f
   ```

4. **Backup Strategy**
   - Backup MongoDB regularly
   - Keep .env files safe
   - Document custom configurations

## Rollback Procedure

```bash
# Save current containers
docker-compose ps

# Stop services
docker-compose stop

# Revert to previous version (if using git)
git checkout <previous-commit>

# Restart with previous code
docker-compose up --build -d
```

## Additional Resources

- Deployment Guide: See `DEPLOYMENT.md`
- Docker Compose Docs: https://docs.docker.com/compose/
- MongoDB Connection: https://www.mongodb.com/docs/manual/connection-string/
- Nginx Proxy: https://nginx.org/en/docs/http/ngx_http_proxy_module.html

---

**Last Updated**: January 26, 2026
**Status**: ✅ Ready for VM Deployment
