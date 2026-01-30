# Grafana Deployment for Azure Container Apps

This directory contains the Grafana configuration for visualizing metrics from Prometheus.

## Quick Deploy to Azure Container Apps

### 1. Deploy using Azure Container Instance Grafana image

```bash
# Deploy Grafana to Container Apps
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
    GF_SERVER_ROOT_URL=https://winonboard-grafana.gentlemeadow-8e12f1a7.westus2.azurecontainerapps.io \
    GF_INSTALL_PLUGINS=grafana-piechart-panel

# Get Grafana URL
az containerapp show \
  --name winonboard-grafana \
  --resource-group rg_pavan \
  --query properties.configuration.ingress.fqdn -o tsv
```

## Access Grafana

- **URL**: Will be shown after deployment (e.g., https://winonboard-grafana.gentlemeadow-8e12f1a7.westus2.azurecontainerapps.io)
- **Username**: admin
- **Password**: Admin@123 (set via GF_SECURITY_ADMIN_PASSWORD)

## Configure Prometheus Data Source

After deploying, add Prometheus as a data source:

1. Login to Grafana
2. Go to **Configuration** → **Data Sources**
3. Click **Add data source**
4. Select **Prometheus**
5. Configure:
   - **Name**: Prometheus
   - **URL**: `http://winonboard-prometheus.internal.gentlemeadow-8e12f1a7.westus2.azurecontainerapps.io:9090`
   - Click **Save & Test**

## Import Dashboards

### Recommended Dashboard IDs:
- **11159**: Node.js Application Dashboard
- **1860**: Node Exporter Full
- **6417**: Express.js Dashboard
- **7362**: MongoDB Monitoring

To import:
1. Go to **Dashboards** → **Import**
2. Enter dashboard ID
3. Select Prometheus data source
4. Click **Import**

## Custom Metrics to Monitor

Your backend exposes these metrics on `/metrics`:

- `http_server_duration_ms` - HTTP request duration
- `http_server_requests_total` - Total HTTP requests
- `mongodb_operations_duration` - MongoDB operation time
- `process_cpu_user_seconds_total` - CPU usage
- `process_resident_memory_bytes` - Memory usage
- `nodejs_eventloop_lag_seconds` - Event loop lag

## Sample Queries

### Request Rate
```promql
rate(http_server_requests_total[5m])
```

### Error Rate
```promql
rate(http_server_requests_total{status_code=~"5.."}[5m])
```

### P95 Response Time
```promql
histogram_quantile(0.95, rate(http_server_duration_ms_bucket[5m]))
```

### MongoDB Query Time
```promql
rate(mongodb_operations_duration_sum[5m]) / rate(mongodb_operations_duration_count[5m])
```
