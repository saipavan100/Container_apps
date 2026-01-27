# GitHub Actions CI/CD Setup - OIDC Authentication

## How It Works

✅ **Federated OIDC** - No client secret stored in GitHub  
✅ **App Registration** - Uses Azure Entra ID application  
✅ **Token Exchange** - GitHub issues OIDC token, Azure validates it

## Required GitHub Secrets

Add these 9 secrets to GitHub (Settings → Secrets and variables → Actions):

### Azure Credentials (from App Registration)
```
AZURE_CLIENT_ID              → App Registration Client ID
AZURE_TENANT_ID              → Azure Tenant ID  
AZURE_SUBSCRIPTION_ID        → Azure Subscription ID
```

### ACR Credentials
```
ACR_REGISTRY                 → myacr.azurecr.io
ACR_USERNAME                 → ACR username (from Access Keys)
ACR_PASSWORD                 → ACR password (from Access Keys)
```

### Azure Resources
```
AZURE_RESOURCE_GROUP         → your-resource-group-name
BACKEND_CONTAINER_APP_NAME   → winonboard-backend
FRONTEND_CONTAINER_APP_NAME  → winonboard-frontend
```

## Get Credentials from Azure

### 1. Get App Registration Credentials
```bash
# List your app registrations
az ad app list --display-name "github-actions" --query "[].{id: appId, displayName: displayName}" -o table

# Get Client ID
AZURE_CLIENT_ID=$(az ad app list --display-name "github-actions" --query "[0].appId" -o tsv)

# Get Tenant ID
AZURE_TENANT_ID=$(az account show --query tenantId -o tsv)

# Get Subscription ID
AZURE_SUBSCRIPTION_ID=$(az account show --query id -o tsv)

echo "AZURE_CLIENT_ID: $AZURE_CLIENT_ID"
echo "AZURE_TENANT_ID: $AZURE_TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID: $AZURE_SUBSCRIPTION_ID"
```

### 2. Get ACR Credentials
```bash
# Get ACR login server
ACR_REGISTRY=$(az acr list --query "[0].loginServer" -o tsv)

# Get admin username and password
az acr credential show --name myacr --query "{username: username, password: passwords[0].value}"

echo "ACR_REGISTRY: $ACR_REGISTRY"
```

### 3. Get Container App Names & Resource Group
```bash
# List container apps
az containerapp list --query "[].{name: name, resourceGroup: resourceGroup}" -o table

echo "AZURE_RESOURCE_GROUP: your-rg"
echo "BACKEND_CONTAINER_APP_NAME: winonboard-backend"
echo "FRONTEND_CONTAINER_APP_NAME: winonboard-frontend"
```

## Add Secrets to GitHub

### Using GitHub CLI
```bash
gh secret set AZURE_CLIENT_ID --body "$AZURE_CLIENT_ID" --repo username/repo
gh secret set AZURE_TENANT_ID --body "$AZURE_TENANT_ID" --repo username/repo
gh secret set AZURE_SUBSCRIPTION_ID --body "$AZURE_SUBSCRIPTION_ID" --repo username/repo
gh secret set ACR_REGISTRY --body "$ACR_REGISTRY" --repo username/repo
gh secret set ACR_USERNAME --body "admin-username" --repo username/repo
gh secret set ACR_PASSWORD --body "admin-password" --repo username/repo
gh secret set AZURE_RESOURCE_GROUP --body "your-rg" --repo username/repo
gh secret set BACKEND_CONTAINER_APP_NAME --body "winonboard-backend" --repo username/repo
gh secret set FRONTEND_CONTAINER_APP_NAME --body "winonboard-frontend" --repo username/repo
```

### Or Via GitHub UI
1. Go to: Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret from list above

## How Federated OIDC Works

1. **Push to main** → GitHub Actions workflow starts
2. **GitHub generates OIDC token** → Contains workflow info (repo, branch, commit, etc.)
3. **Azure receives token** → Validates signature and trusted issuer
4. **Access granted** → Workflow authenticates to Azure without using secrets
5. **Build & Deploy** → Images pushed to ACR, Container Apps updated

## Pipeline Flow

```
┌─────────────────────┐
│  git push main      │
└────────────┬────────┘
             │
             ▼
┌─────────────────────────────┐
│ GitHub Actions Starts       │
│ - Checkout code             │
│ - Setup Docker Buildx       │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Azure Login (OIDC)          │
│ - No secret needed!         │
│ - Token-based auth          │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Build Images                │
│ - Backend Dockerfile        │
│ - Frontend Dockerfile       │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Push to ACR                 │
│ - backend:latest            │
│ - frontend:latest           │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ Deploy to Container Apps    │
│ - Update backend image      │
│ - Update frontend image     │
└────────────┬────────────────┘
             │
             ▼
         ✅ Done
```

## Verify Setup

```bash
# Check secrets exist
gh secret list --repo username/repo

# Manually trigger workflow
git push origin main

# Monitor workflow
gh run list --repo username/repo
gh run view <run-id> --log
```

## Security Benefits

✅ **No client secret in GitHub** - Uses token exchange instead  
✅ **Limited token lifetime** - Tokens expire after workflow  
✅ **Trusted issuer** - Only GitHub.com tokens accepted  
✅ **Audit trail** - All access logged in Azure  
✅ **Repository scoped** - Different tokens per repo possible  

## References

- [Azure Federated OIDC Documentation](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
