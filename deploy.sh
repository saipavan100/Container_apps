#!/bin/bash

# WinOnBoard Docker Deployment Script
# Usage: ./deploy.sh <VM_IP> [mode]
# Example: ./deploy.sh 3.145.152.128 production

set -e

VM_IP="${1:-localhost}"
MODE="${2:-development}"

echo "🚀 WinOnBoard Deployment Script"
echo "================================"
echo "VM IP: $VM_IP"
echo "Mode: $MODE"
echo ""

# Validate inputs
if [ "$VM_IP" == "localhost" ] && [ "$MODE" == "production" ]; then
    echo "⚠️  Warning: Using localhost in production mode!"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Update environment files
echo "📝 Updating environment configuration..."

# Update backend .env.production
if [ "$MODE" == "production" ]; then
    sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://$VM_IP,http://$VM_IP:80,http://$VM_IP:3000|g" backend/.env.production
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$VM_IP|g" backend/.env.production
    sed -i "s|BACKEND_URL=.*|BACKEND_URL=http://$VM_IP:8080|g" backend/.env.production
    echo "✅ Updated backend/.env.production with VM IP: $VM_IP"
fi

# Update frontend .env.production
sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://$VM_IP:8080/api|g" frontend/.env.production
echo "✅ Updated frontend/.env.production with VM IP: $VM_IP"

# Build and start
echo ""
echo "🐳 Building and starting Docker containers..."
if [ "$MODE" == "production" ]; then
    docker-compose -f docker-compose.production.yml up --build -d
else
    docker-compose up --build -d
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🔗 Access the application:"
echo "  Frontend: http://$VM_IP"
echo "  Backend API: http://$VM_IP:8080/api"
echo ""
echo "📋 To view logs:"
echo "  All logs: docker-compose logs -f"
echo "  Backend: docker-compose logs -f backend"
echo "  Frontend: docker-compose logs -f frontend"
