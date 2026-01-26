# WinOnBoard Docker Deployment Script (Windows)
# Usage: .\deploy.ps1 -VMIp "3.145.152.128" -Mode "production"
# Example: .\deploy.ps1 -VMIp "3.145.152.128"

param(
    [string]$VMIp = "localhost",
    [string]$Mode = "development"
)

Write-Host "🚀 WinOnBoard Deployment Script (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VM IP: $VMIp" -ForegroundColor Yellow
Write-Host "Mode: $Mode" -ForegroundColor Yellow
Write-Host ""

# Validate inputs
if ($VMIp -eq "localhost" -and $Mode -eq "production") {
    Write-Host "⚠️  Warning: Using localhost in production mode!" -ForegroundColor Red
    $response = Read-Host "Continue? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

# Update environment files
Write-Host "📝 Updating environment configuration..." -ForegroundColor Cyan

# Update backend .env.production
$backendEnvPath = "backend\.env.production"
if (Test-Path $backendEnvPath) {
    if ($Mode -eq "production") {
        $content = Get-Content $backendEnvPath
        $content = $content -replace "ALLOWED_ORIGINS=.*", "ALLOWED_ORIGINS=http://$VMIp,http://$VMIp`:80,http://$VMIp`:3000"
        $content = $content -replace "FRONTEND_URL=.*", "FRONTEND_URL=http://$VMIp"
        $content = $content -replace "BACKEND_URL=.*", "BACKEND_URL=http://$VMIp`:8080"
        Set-Content $backendEnvPath $content
        Write-Host "✅ Updated backend\.env.production with VM IP: $VMIp" -ForegroundColor Green
    }
}

# Update frontend .env.production
$frontendEnvPath = "frontend\.env.production"
if (Test-Path $frontendEnvPath) {
    $content = Get-Content $frontendEnvPath
    $content = $content -replace "REACT_APP_API_URL=.*", "REACT_APP_API_URL=http://$VMIp`:8080/api"
    Set-Content $frontendEnvPath $content
    Write-Host "✅ Updated frontend\.env.production with VM IP: $VMIp" -ForegroundColor Green
}

# Build and start
Write-Host ""
Write-Host "🐳 Building and starting Docker containers..." -ForegroundColor Cyan

if ($Mode -eq "production") {
    docker-compose -f docker-compose.production.yml up --build -d
} else {
    docker-compose up --build -d
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "🔗 Access the application:" -ForegroundColor Green
Write-Host "  Frontend: http://$VMIp" -ForegroundColor Yellow
Write-Host "  Backend API: http://$VMIp`:8080/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 To view logs:" -ForegroundColor Green
Write-Host "  All logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "  Backend: docker-compose logs -f backend" -ForegroundColor Yellow
Write-Host "  Frontend: docker-compose logs -f frontend" -ForegroundColor Yellow
