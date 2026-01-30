# ============================================================================
# Deploy Complete Vendor-Neutral Observability Stack
# ============================================================================
# Components:
#   1. Loki          - Log storage (internal)
#   2. OTEL Collector - Telemetry pipeline (internal)
#   3. Prometheus    - Metrics storage (external)
#   4. Grafana       - Visualization (external)
#
# Prerequisites:
#   - Azure CLI installed and logged in
#   - Container Apps Environment already exists
#   - ACR already exists with admin enabled
#   - Backend already deployed
# ============================================================================

$ErrorActionPreference = "Stop"

# Configuration
$RESOURCE_GROUP = "rg_pavan"
$ENVIRONMENT = "winonboard-env"
$ACR_NAME = "winonboard"

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   Vendor-Neutral Observability Stack Deployment" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Components to deploy:" -ForegroundColor White
Write-Host "  > Loki (log storage)               - Internal" -ForegroundColor Yellow
Write-Host "  > OpenTelemetry Collector          - Internal" -ForegroundColor Yellow
Write-Host "  > Prometheus (metrics)             - External" -ForegroundColor Yellow
Write-Host "  > Grafana (dashboards)             - External" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue or Ctrl+C to cancel..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# ============================================================================
# STEP 1: Build and Push Container Images
# ============================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "STEP 1/5: Building Container Images" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Build Loki
Write-Host "[1/3] Building Loki image..." -ForegroundColor Yellow
Push-Location loki
az acr build --registry $ACR_NAME --image loki:v1 . --only-show-errors
Pop-Location
Write-Host "  [OK] loki:v1 built and pushed" -ForegroundColor Green

# Build OTEL Collector
Write-Host "[2/3] Building OpenTelemetry Collector image..." -ForegroundColor Yellow
Push-Location otel-collector
az acr build --registry $ACR_NAME --image otel-collector:v1 . --only-show-errors
Pop-Location
Write-Host "  [OK] otel-collector:v1 built and pushed" -ForegroundColor Green

# Build Prometheus
Write-Host "[3/3] Building Prometheus image..." -ForegroundColor Yellow
Push-Location prometheus
az acr build --registry $ACR_NAME --image prometheus:v1 . --only-show-errors
Pop-Location
Write-Host "  [OK] prometheus:v1 built and pushed" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 2: Deploy Loki (Log Storage)
# ============================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "STEP 2/5: Deploying Loki" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

az containerapp create `
  --name winonboard-loki `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT `
  --image "$ACR_NAME.azurecr.io/loki:v1" `
  --registry-server "$ACR_NAME.azurecr.io" `
  --target-port 3100 `
  --ingress internal `
  --cpu 0.5 `
  --memory 1Gi `
  --only-show-errors | Out-Null

$LOKI_FQDN = az containerapp show `
  --name winonboard-loki `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  [OK] Loki deployed (internal)" -ForegroundColor Green
Write-Host "    FQDN: $LOKI_FQDN" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# STEP 3: Deploy OpenTelemetry Collector (Telemetry Pipeline)
# ============================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "STEP 3/5: Deploying OpenTelemetry Collector" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Update OTEL config with actual Loki FQDN
Write-Host "  Updating OTEL Collector config with Loki endpoint..." -ForegroundColor Yellow
$OTEL_CONFIG_PATH = "otel-collector\otel-collector-config.yaml"
$CONFIG_CONTENT = Get-Content $OTEL_CONFIG_PATH -Raw
$CONFIG_CONTENT = $CONFIG_CONTENT -replace "winonboard-loki\.internal\.[^:]+", $LOKI_FQDN
Set-Content $OTEL_CONFIG_PATH $CONFIG_CONTENT

# Rebuild with updated config
Write-Host "  Rebuilding OTEL Collector with updated config..." -ForegroundColor Yellow
Push-Location otel-collector
az acr build --registry $ACR_NAME --image otel-collector:v2 . --only-show-errors
Pop-Location

az containerapp create `
  --name winonboard-otel-collector `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT `
  --image "$ACR_NAME.azurecr.io/otel-collector:v2" `
  --registry-server "$ACR_NAME.azurecr.io" `
  --target-port 4318 `
  --ingress internal `
  --cpu 0.5 `
  --memory 1Gi `
  --only-show-errors | Out-Null

$OTEL_FQDN = az containerapp show `
  --name winonboard-otel-collector `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  [OK] OTEL Collector deployed (internal)" -ForegroundColor Green
Write-Host "    FQDN: $OTEL_FQDN" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# STEP 4: Deploy Prometheus (Metrics Storage)
# ============================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "STEP 4/5: Deploying Prometheus" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Update Prometheus config to scrape OTEL Collector
Write-Host "  Updating Prometheus config to scrape OTEL Collector..." -ForegroundColor Yellow
$PROM_CONFIG_PATH = "prometheus\prometheus.yml"
$PROM_CONTENT = Get-Content $PROM_CONFIG_PATH -Raw
$PROM_CONTENT = $PROM_CONTENT -replace "winonboard-backend\.[^:]+:9464", "${OTEL_FQDN}:9464"
Set-Content $PROM_CONFIG_PATH $PROM_CONTENT

# Rebuild with updated config
Write-Host "  Rebuilding Prometheus with updated config..." -ForegroundColor Yellow
Push-Location prometheus
az acr build --registry $ACR_NAME --image prometheus:v2 . --only-show-errors
Pop-Location

az containerapp create `
  --name winonboard-prometheus `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT `
  --image "$ACR_NAME.azurecr.io/prometheus:v2" `
  --registry-server "$ACR_NAME.azurecr.io" `
  --target-port 9090 `
  --ingress external `
  --cpu 0.5 `
  --memory 1Gi `
  --only-show-errors | Out-Null

$PROMETHEUS_FQDN = az containerapp show `
  --name winonboard-prometheus `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  [OK] Prometheus deployed (external)" -ForegroundColor Green
Write-Host "    URL: https://$PROMETHEUS_FQDN" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# STEP 5: Deploy Grafana (Visualization)
# ============================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "STEP 5/5: Deploying Grafana" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

az containerapp create `
  --name winonboard-grafana `
  --resource-group $RESOURCE_GROUP `
  --environment $ENVIRONMENT `
  --image grafana/grafana:10.2.3 `
  --target-port 3000 `
  --ingress external `
  --cpu 0.5 `
  --memory 1Gi `
  --env-vars "GF_SECURITY_ADMIN_PASSWORD=Admin@123" "GF_INSTALL_PLUGINS=grafana-piechart-panel" `
  --only-show-errors | Out-Null

$GRAFANA_FQDN = az containerapp show `
  --name winonboard-grafana `
  --resource-group $RESOURCE_GROUP `
  --query properties.configuration.ingress.fqdn -o tsv

Write-Host "  [OK] Grafana deployed (external)" -ForegroundColor Green
Write-Host "    URL: https://$GRAFANA_FQDN" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# STEP 6: Update Backend with OTEL Collector URL
# ============================================================================

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Updating Backend Configuration" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

az containerapp update `
  --name winonboard-backend `
  --resource-group $RESOURCE_GROUP `
  --set-env-vars "OTEL_COLLECTOR_URL=http://${OTEL_FQDN}:4318" `
  --only-show-errors | Out-Null

Write-Host "  [OK] Backend configured to send telemetry to OTEL Collector" -ForegroundColor Green
Write-Host ""

# ============================================================================
# DEPLOYMENT SUMMARY
# ============================================================================

Write-Host "================================================================════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "|          Observability Stack Deployed Successfully!       |" -ForegroundColor Green
Write-Host "================================================================════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Architecture:" -ForegroundColor Cyan
Write-Host "  Backend -> OTEL Collector -> Loki (logs)" -ForegroundColor White
Write-Host "                          -> Prometheus (metrics)" -ForegroundColor White
Write-Host "                          -> All visible in Grafana" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  ┌─────────────────────────────────────────────────────────┐" -ForegroundColor Gray
Write-Host "  │ Grafana:    https://$GRAFANA_FQDN" -ForegroundColor Yellow
Write-Host "  │ Prometheus: https://$PROMETHEUS_FQDN" -ForegroundColor Yellow
Write-Host "  └─────────────────────────────────────────────────────────┘" -ForegroundColor Gray
Write-Host ""

Write-Host "🔐 Grafana Login:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: Admin@123" -ForegroundColor White
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Open Grafana: https://$GRAFANA_FQDN" -ForegroundColor White
Write-Host ""
Write-Host "  2. Add Prometheus Data Source:" -ForegroundColor White
Write-Host "     - Configuration -> Data Sources -> Add data source" -ForegroundColor Gray
Write-Host "     - Select 'Prometheus'" -ForegroundColor Gray
Write-Host "     - URL: https://$PROMETHEUS_FQDN" -ForegroundColor Gray
Write-Host "     - Save `& Test" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Add Loki Data Source:" -ForegroundColor White
Write-Host "     - Configuration -> Data Sources -> Add data source" -ForegroundColor Gray
Write-Host "     - Select 'Loki'" -ForegroundColor Gray
Write-Host "     - URL: http://$LOKI_FQDN" -ForegroundColor Gray
Write-Host "     - Save `& Test" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Import Dashboards (optional):" -ForegroundColor White
Write-Host "     - Node.js App:    ID 11159" -ForegroundColor Gray
Write-Host "     - Express.js:     ID 6417" -ForegroundColor Gray
Write-Host "     - Node Exporter:  ID 1860" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Benefits:" -ForegroundColor Cyan
Write-Host "  [OK] No vendor lock-in - all open-source tools" -ForegroundColor Green
Write-Host "  [OK] Backend sends data via standard OTLP protocol" -ForegroundColor Green
Write-Host "  [OK] Change monitoring tools without changing app code" -ForegroundColor Green
Write-Host "  [OK] Centralized telemetry processing in OTEL Collector" -ForegroundColor Green
Write-Host ""

Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "  - Architecture:        VENDOR_NEUTRAL_ARCHITECTURE.md" -ForegroundColor Gray
Write-Host "  - Setup Guide:         OBSERVABILITY_SETUP.md" -ForegroundColor Gray
Write-Host "  - Log Explanation:     LOGS_EXPLAINED.md" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Gray

