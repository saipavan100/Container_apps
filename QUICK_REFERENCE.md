# 🚀 Quick Reference - VM Deployment

## Replace `<VM_IP>` with your actual VM IP (e.g., 3.145.152.128)

### ⚡ Quick Deploy (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh <VM_IP> production
```

### ⚡ Quick Deploy (Windows)
```powershell
.\deploy.ps1 -VMIp "<VM_IP>" -Mode "production"
```

### ⚡ Manual Deploy
```bash
# Update configs
sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://<VM_IP>,http://<VM_IP>:80|" backend/.env.production
sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://<VM_IP>:8080/api|" frontend/.env.production

# Start
docker-compose -f docker-compose.production.yml up --build -d

# Verify
docker-compose ps
curl http://<VM_IP>:8080/api/health
```

## 📍 Access Application
- **Frontend**: `http://<VM_IP>`
- **Backend API**: `http://<VM_IP>:8080/api`

## 🔍 Check Status
```bash
docker-compose ps                    # Container status
docker-compose logs -f               # Live logs
docker-compose logs -f backend       # Backend logs only
docker-compose logs -f frontend      # Frontend logs only
```

## 🔧 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| API returns 404 | Update `ALLOWED_ORIGINS` in `backend/.env.production` |
| Frontend can't reach API | Verify `REACT_APP_API_URL` in `frontend/.env.production` |
| Favicon 404 | ✅ Fixed - already configured |
| CORS errors | Restart backend: `docker-compose restart backend` |
| MongoDB connection fails | Verify connection string in `.env.production` |

## 📋 Files You Need to Update

1. **backend/.env.production**
   ```
   ALLOWED_ORIGINS=http://<VM_IP>,http://<VM_IP>:80
   MONGODB_URI=<your-connection-string>
   JWT_SECRET=<change-this>
   ADMIN_EMAIL=<your-email>
   ADMIN_PASSWORD=<strong-password>
   ```

2. **frontend/.env.production**
   ```
   REACT_APP_API_URL=http://<VM_IP>:8080/api
   ```

## 📚 Full Documentation
- See `DEPLOYMENT.md` for complete guide
- See `DEPLOYMENT_CHECKLIST.md` for verification
- See `CHANGES_SUMMARY.md` for what was changed

---

**Created**: January 26, 2026 | **Status**: ✅ Ready to Deploy
