# CI/CD Pipeline - Build & Deploy

Simple one-step pipeline that builds Docker images and deploys to Azure Container Apps.

## 🔄 What Happens

When you push to `main` branch:
1. ✅ Builds backend Docker image
2. ✅ Builds frontend Docker image
3. ✅ Pushes both to ACR
4. ✅ Deploys to Azure Container Apps

## 🚀 Setup (2 minutes)

### 1. Get Azure Credentials
See [GET_AZURE_CREDENTIALS.md](./GET_AZURE_CREDENTIALS.md) for detailed steps.

Quick command:
```bash
az ad sp create-for-rbac \
  --name "github-actions" \
  --role "Contributor" \
  --scope "/subscriptions/{SUBSCRIPTION_ID}"
```

### 2. Add GitHub Secrets

```bash
gh secret set AZURE_CLIENT_ID --body "your-client-id"
gh secret set AZURE_TENANT_ID --body "your-tenant-id"
gh secret set AZURE_SUBSCRIPTION_ID --body "your-sub-id"
gh secret set ACR_REGISTRY --body "myacr.azurecr.io"
gh secret set ACR_USERNAME --body "myacr-username"
gh secret set ACR_PASSWORD --body "myacr-password"
gh secret set AZURE_RESOURCE_GROUP --body "your-resource-group"
gh secret set BACKEND_CONTAINER_APP_NAME --body "winonboard-backend"
gh secret set FRONTEND_CONTAINER_APP_NAME --body "winonboard-frontend"
```

### 3. Set App Secrets in Azure Container Apps

⚠️ **Don't put app secrets in GitHub!**

Set them directly in Azure:
```bash
az containerapp update \
  --name winonboard-backend \
  --resource-group your-rg \
  --set-env-vars \
    MONGODB_URI="your-mongodb-uri" \
    JWT_SECRET="your-jwt-secret" \
    ADMIN_EMAIL="admin@example.com" \
    ADMIN_PASSWORD="password" \
    NODE_ENV="production"
```

### 4. Push Code

```bash
git push origin main
```

✅ Pipeline will run automatically!

## 📊 Monitor Pipeline

### View Workflow Runs
```bash
gh run list
```

### View Specific Run
```bash
gh run view <run-id> --log
```

### Check Container App Status
```bash
az containerapp show \
  --name winonboard-backend \
  --resource-group your-rg
```

## 📁 Workflow Files

- `.github/workflows/build-deploy.yml` - Main pipeline

## ✅ Verify Setup

After first push:
1. Check GitHub Actions tab - should show successful run
2. Check ACR - images should be there
3. Check Container Apps - should be updated

Done! 🎉
