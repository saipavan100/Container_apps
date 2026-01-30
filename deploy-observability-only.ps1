# Deploy Observability Stack (Images Must Already Exist in ACR)
# Run this AFTER GitHub Actions builds the images

$ErrorActionPreference = "Stop"

$RESOURCE_GROUP = "rg_pavan"
$ENVIRONMENT = "winonboard-env"
$ACR_NAME = "winonboard"

Write-Host ""
Write-Host "================================================================"
Write-Host "   Deploying Observability Stack (from pre-built images)"
Write-Host "================================================================"
Write-Host ""
Write-Host "Note: This script assumes images already exist in ACR."
Write-Host "      Use GitHub Actions workflow to build images first."
Write-Host ""

# Deploy Loki
Write-Host "[1/4] Deploying Loki..." -ForegroundColor Cyan
az containerapp create `
  --name winonboard-loki `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT `
  --image "$ACR_NAME.azurecr.io/loki:v1" `
  --registry-server "$ACR_NAME.azurecr.io" `
  --target-port 3100 `
  --ingress internal `
  --cpu 0.5 `
  --memory 1Gi

$LOKI_FQDN = az containerapp show `
  --name winonboard-loki `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  [OK] Loki: $LOKI_FQDN" -ForegroundColor Green

# Deploy OTEL Collector
Write-Host "[2/4] Deploying OTEL Collector..." -ForegroundColor Cyan
az containerapp create `
  --name winonboard-otel-collector `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT `
  --image "$ACR_NAME.azurecr.io/otel-collector:v1" `
  --registry-server "$ACR_NAME.azurecr.io" `
  --target-port 4318 `
  --ingress internal `
  --cpu 0.5 `
  --memory 1Gi

$OTEL_FQDN = az containerapp show `
  --name winonboard-otel-collector `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  [OK] OTEL Collector: $OTEL_FQDN" -ForegroundColor Green

# Deploy Prometheus
Write-Host "[3/4] Deploying Prometheus..." -ForegroundColor Cyan
az containerapp create `
  --name winonboard-prometheus `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT `
  --image "$ACR_NAME.azurecr.io/prometheus:v1" `
  --registry-server "$ACR_NAME.azurecr.io" `
  --target-port 9090 `
  --ingress external `
  --cpu 0.5 `
  --memory 1Gi

$PROMETHEUS_FQDN = az containerapp show `
  --name winonboard-prometheus `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  [OK] Prometheus: https://$PROMETHEUS_FQDN" -ForegroundColor Green

# Deploy Grafana
Write-Host "[4/4] Deploying Grafana..." -ForegroundColor Cyan
az containerapp create `
  --name winonboard-grafana `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT `
  --image grafana/grafana:10.2.3 `
  --target-port 3000 `
  --ingress external `
  --cpu 0.5 `
  --memory 1Gi `
  --env-vars "GF_SECURITY_ADMIN_PASSWORD=Admin@123" "GF_INSTALL_PLUGINS=grafana-piechart-panel"

$GRAFANA_FQDN = az containerapp show `
  --name winonboard-grafana `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  [OK] Grafana: https://$GRAFANA_FQDN" -ForegroundColor Green

# Update Backend
Write-Host ""
Write-Host "Updating backend with OTEL Collector URL..." -ForegroundColor Cyan
az containerapp update `
  --name winonboard-backend `
  --resource-group $RESOURCE_GROUP `
  --set-env-vars "OTEL_COLLECTOR_URL=http://${OTEL_FQDN}:4318"

Write-Host "[OK] Backend updated" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "================================================================"
Write-Host "   Deployment Complete!"
Write-Host "================================================================"
Write-Host ""
Write-Host "Prometheus: https://$PROMETHEUS_FQDN" -ForegroundColor Yellow
Write-Host "Grafana:    https://$GRAFANA_FQDN" -ForegroundColor Yellow
Write-Host ""
Write-Host "Grafana Login: admin / Admin@123" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Configure data sources in Grafana"
Write-Host "  1. Add Prometheus: https://$PROMETHEUS_FQDN"
Write-Host "  2. Add Loki: http://$LOKI_FQDN"
