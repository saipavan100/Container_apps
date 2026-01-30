# OpenTelemetry + Prometheus + Grafana Observability Stack

Complete setup guide for monitoring your WinOnboard application with OpenTelemetry, Prometheus, and Grafana.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Backend Application                      │
│  (instrumented with OpenTelemetry SDK)                      │
│                                                              │
│  ┌────────────────────────────────────────────┐            │
│  │  Express Routes                             │            │
│  │  MongoDB Operations                         │            │
│  │  Azure OpenAI Calls                         │            │
│  │  HTTP Requests                              │            │
│  └────────────────────────────────────────────┘            │
│                         │                                    │
│                         ↓                                    │
│  ┌────────────────────────────────────────────┐            │
│  │  OpenTelemetry Auto-Instrumentation        │            │
│  │  - Captures metrics, traces, logs          │            │
│  └────────────────────────────────────────────┘            │
│                         │                                    │
│           ┌─────────────┼─────────────┐                    │
│           │             │              │                    │
│           ↓             ↓              ↓                    │
│     [Metrics]      [Traces]       [Logs]                   │
│           │             │              │                    │
│           ↓             │              ↓                    │
│  Prometheus Exporter    │     Console/Log Analytics        │
│  (Port 9464/metrics)    ↓                                   │
│                   OTLP HTTP Exporter                        │
└─────────────────────────────────────────────────────────────┘
           │                     │
           ↓                     ↓
┌──────────────────┐    ┌───────────────────┐
│   Prometheus     │    │  OTLP Collector   │
│   Server         │    │  (Optional)       │
│  - Scrapes       │    │  - Receives       │
│    /metrics      │    │    traces         │
│  - Stores        │    │  - Forwards to    │
│    time-series   │    │    Jaeger/etc     │
│  - Retention:    │    └───────────────────┘
│    15 days       │
└──────────────────┘
           │
           ↓
┌──────────────────────────────────────────┐
│          Grafana Dashboard               │
│  - Connects to Prometheus                │
│  - Visualizes metrics                    │
│  - Creates alerts                        │
│  - Custom dashboards                     │
└──────────────────────────────────────────┘
```

## Step 1: Install Backend Dependencies

Already completed - OpenTelemetry packages added to `backend/package.json`:

```bash
cd backend
npm install
```

Packages installed:
- `@opentelemetry/api`: Core API
- `@opentelemetry/sdk-node`: Node.js SDK
- `@opentelemetry/auto-instrumentations-node`: Auto-instrumentation
- `@opentelemetry/exporter-prometheus`: Prometheus metrics exporter
- `@opentelemetry/exporter-trace-otlp-http`: Trace exporter
- `@opentelemetry/resources`: Resource metadata
- `@opentelemetry/semantic-conventions`: Standard attribute names

## Step 2: Test Locally

### Start Backend with OpenTelemetry

```bash
cd backend
npm start
```

You should see:
```
✅ OpenTelemetry initialized
📍 Service: winonboard-backend
📊 Metrics: http://localhost:9464/metrics
🔍 Traces: http://otel-collector:4318
```

### Verify Metrics Endpoint

```bash
curl http://localhost:9464/metrics
```

Expected output (sample):
```
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.5

# HELP http_server_duration_ms HTTP request duration in milliseconds
# TYPE http_server_duration_ms histogram
http_server_duration_ms_bucket{le="10",method="GET",route="/api/health",status_code="200"} 5
http_server_duration_ms_bucket{le="50",method="GET",route="/api/health",status_code="200"} 8
http_server_duration_ms_sum{method="GET",route="/api/health",status_code="200"} 245
http_server_duration_ms_count{method="GET",route="/api/health",status_code="200"} 10
```

## Step 3: Update Backend Dockerfile (Expose Metrics Port)

Update `backend/Dockerfile` to expose port 9464:

```dockerfile
# Expose application port and metrics port
EXPOSE 8080
EXPOSE 9464
```

## Step 4: Build and Deploy Updated Backend

### Build and Push to ACR

```bash
# Login to ACR
az acr login --name winonboard

# Build backend with OpenTelemetry
cd backend
docker build -t winonboard.azurecr.io/backend:v2-otel .

# Push to ACR
docker push winonboard.azurecr.io/backend:v2-otel
```

### Update Container App

```bash
# Update backend with new image
az containerapp update \
  --name winonboard-backend \
  --resource-group rg_pavan \
  --image winonboard.azurecr.io/backend:v2-otel

# Verify deployment
az containerapp show \
  --name winonboard-backend \
  --resource-group rg_pavan \
  --query properties.template.containers[0].image -o tsv
```

### Verify Backend Health

```bash
# Test health endpoint
curl https://winonboard-backend.gentlemeadow-8e12f1a7.westus2.azurecontainerapps.io/health

# Test metrics endpoint (requires exposing port 9464 in ingress or internal access)
# Note: Metrics should be accessible internally for Prometheus
```

## Step 5: Deploy Prometheus

### Option A: Direct Image Deployment (Recommended)

```bash
# Create Container App with Prometheus
az containerapp create \
  --name winonboard-prometheus \
  --resource-group rg_pavan \
  --environment winonboard-env \
  --image prom/prometheus:v2.48.1 \
  --target-port 9090 \
  --ingress external \
  --cpu 0.5 \
  --memory 1Gi \
  --command "/bin/prometheus" \
  --args "--config.file=/etc/prometheus/prometheus.yml" \
         "--storage.tsdb.path=/prometheus" \
         "--web.enable-lifecycle"

# Get Prometheus URL
az containerapp show \
  --name winonboard-prometheus \
  --resource-group rg_pavan \
  --query properties.configuration.ingress.fqdn -o tsv
```

### Option B: Build Custom Image with Config

```bash
# Build Prometheus image
cd prometheus
docker build -t winonboard.azurecr.io/prometheus:v1 .
docker push winonboard.azurecr.io/prometheus:v1

# Deploy to Container Apps
az containerapp create \
  --name winonboard-prometheus \
  --resource-group rg_pavan \
  --environment winonboard-env \
  --image winonboard.azurecr.io/prometheus:v1 \
  --target-port 9090 \
  --ingress external \
  --cpu 0.5 \
  --memory 1Gi
```

### Configure Prometheus to Scrape Backend

You need to update Prometheus configuration to scrape your backend's `/metrics` endpoint.

**Important**: Since backend now has external ingress, update `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'winonboard-backend'
    static_configs:
      - targets: ['winonboard-backend.gentlemeadow-8e12f1a7.westus2.azurecontainerapps.io:9464']
    scheme: https  # Use HTTPS for external ingress
    tls_config:
      insecure_skip_verify: true  # Skip cert verification for Azure Container Apps certs
```

Then rebuild and redeploy Prometheus.

### Access Prometheus UI

```bash
# Get Prometheus URL
PROMETHEUS_URL=$(az containerapp show \
  --name winonboard-prometheus \
  --resource-group rg_pavan \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Prometheus: https://$PROMETHEUS_URL"
```

Verify:
1. Open Prometheus UI
2. Go to **Status** → **Targets**
3. Verify `winonboard-backend` target is UP

## Step 6: Deploy Grafana

```bash
# Create Grafana Container App
az containerapp create \
  --name winonboard-grafana \
  --resource-group rg_pavan \
  --environment winonboard-env \
  --image grafana/grafana:10.2.3 \
  --target-port 3000 \
  --ingress external \
  --cpu 0.5 \
  --memory 1Gi \
  --env-vars \
    GF_SECURITY_ADMIN_PASSWORD=Admin@123 \
    GF_INSTALL_PLUGINS=grafana-piechart-panel

# Get Grafana URL
GRAFANA_URL=$(az containerapp show \
  --name winonboard-grafana \
  --resource-group rg_paven \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "Grafana: https://$GRAFANA_URL"
echo "Username: admin"
echo "Password: Admin@123"
```

## Step 7: Configure Grafana

### 1. Add Prometheus Data Source

1. Login to Grafana (admin/Admin@123)
2. Click **Configuration** (gear icon) → **Data Sources**
3. Click **Add data source**
4. Select **Prometheus**
5. Configure:
   - **Name**: Prometheus
   - **URL**: `https://winonboard-prometheus.gentlemeadow-8e12f1a7.westus2.azurecontainerapps.io`
   - **Skip TLS Verification**: Enable (for Azure Container Apps)
6. Click **Save & Test**

### 2. Import Pre-built Dashboards

Go to **Dashboards** → **Import** and use these IDs:

- **11159**: Node.js Application Dashboard
- **6417**: Express.js Dashboard  
- **1860**: Node Exporter Full
- **7362**: MongoDB Monitoring

### 3. Create Custom Dashboard

Create a new dashboard with panels:

#### Request Rate Panel
```promql
rate(http_server_requests_total[5m])
```

#### P95 Response Time
```promql
histogram_quantile(0.95, 
  rate(http_server_duration_ms_bucket[5m])
)
```

#### Error Rate
```promql
rate(http_server_requests_total{status_code=~"5.."}[5m]) / 
rate(http_server_requests_total[5m]) * 100
```

#### Active Requests by Endpoint
```promql
sum by (route) (http_server_requests_total)
```

#### MongoDB Operation Duration
```promql
rate(mongodb_operations_duration_sum[5m]) / 
rate(mongodb_operations_duration_count[5m])
```

#### Memory Usage
```promql
process_resident_memory_bytes / 1024 / 1024
```

#### CPU Usage
```promql
rate(process_cpu_user_seconds_total[5m]) * 100
```

## Step 8: Set Up Alerts

In Grafana, create alert rules:

### High Error Rate Alert
```
Alert when: 
  rate(http_server_requests_total{status_code=~"5.."}[5m]) / 
  rate(http_server_requests_total[5m]) * 100 > 5

For: 5 minutes
```

### High Response Time Alert
```
Alert when:
  histogram_quantile(0.95, 
    rate(http_server_duration_ms_bucket[5m])
  ) > 1000

For: 5 minutes
```

### High Memory Usage
```
Alert when:
  process_resident_memory_bytes > 900000000  # 900 MB

For: 10 minutes
```

## Verification Checklist

- [ ] Backend exposes `/metrics` endpoint on port 9464
- [ ] Prometheus scrapes backend successfully (check Targets page)
- [ ] Prometheus UI shows metrics data
- [ ] Grafana connects to Prometheus data source
- [ ] Dashboards display metrics correctly
- [ ] Alerts are configured and working

## Troubleshooting

### Backend metrics not showing

```bash
# Check backend logs
az containerapp logs show \
  --name winonboard-backend \
  --resource-group rg_pavan \
  --tail 50

# Verify OpenTelemetry initialization
# Look for "✅ OpenTelemetry initialized" message
```

### Prometheus can't scrape backend

1. Verify backend external FQDN is correct in prometheus.yml
2. Check if backend port 9464 is accessible
3. Verify TLS configuration (use `insecure_skip_verify: true` for Azure)

### Grafana can't connect to Prometheus

1. Verify Prometheus FQDN is correct
2. Check "Skip TLS Verification" is enabled
3. Test Prometheus endpoint manually: `curl https://PROMETHEUS_FQDN/api/v1/query?query=up`

## Additional Enhancements

### 1. Add Persistent Storage for Prometheus

```bash
# Create Azure File Share for Prometheus data
az storage share create \
  --name prometheus-data \
  --account-name <storage-account> \
  --quota 10

# Update Container App with volume mount
az containerapp update \
  --name winonboard-prometheus \
  --resource-group rg_pavan \
  --set-env-vars PROMETHEUS_STORAGE_PATH=/prometheus-data
  # Add volume mount configuration
```

### 2. Deploy OpenTelemetry Collector (Optional)

For advanced trace collection and processing:

```bash
az containerapp create \
  --name winonboard-otel-collector \
  --resource-group rg_pavan \
  --environment winonboard-env \
  --image otel/opentelemetry-collector:0.91.0 \
  --target-port 4318 \
  --ingress internal \
  --cpu 0.5 \
  --memory 1Gi
```

Update backend `tracing.js`:
```javascript
url: 'https://winonboard-otel-collector.internal.../v1/traces'
```

### 3. Integrate with Azure Log Analytics

Query OpenTelemetry logs in Log Analytics:

```kusto
ContainerAppConsoleLogs_CL
| where ContainerAppName_s == "winonboard-backend"
| where Log_s contains "OpenTelemetry"
| project TimeGenerated, Log_s
| order by TimeGenerated desc
```

## Metrics Reference

Your backend automatically exposes these metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `http_server_duration_ms` | Histogram | HTTP request duration |
| `http_server_requests_total` | Counter | Total HTTP requests |
| `process_cpu_user_seconds_total` | Counter | CPU time |
| `process_resident_memory_bytes` | Gauge | Memory usage |
| `nodejs_eventloop_lag_seconds` | Gauge | Event loop lag |
| `mongodb_operations_duration` | Histogram | MongoDB operation time |
| `http_client_duration_ms` | Histogram | Outbound HTTP requests |

## Cost Optimization

- **Prometheus**: Consider reducing scrape interval from 15s to 30s
- **Retention**: Default 15 days, reduce if needed
- **Grafana**: Can share one instance across multiple apps
- **Container Resources**: Start with 0.5 CPU / 1Gi, monitor and adjust

## Next Steps

1. ✅ Test metrics locally
2. ✅ Deploy updated backend
3. ✅ Deploy Prometheus
4. ✅ Deploy Grafana
5. Configure dashboards
6. Set up alerts
7. Monitor in production
8. Optimize based on actual usage
