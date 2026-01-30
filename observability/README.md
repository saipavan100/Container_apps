# Observability Stack

Complete vendor-neutral observability for WinOnboard application using OpenTelemetry, Prometheus, Loki, and Grafana.

## 🚀 Quick Deploy

```powershell
.\deploy-observability.ps1
```

That's it! This deploys:
- ✅ OpenTelemetry Collector (telemetry pipeline)
- ✅ Loki (log storage)
- ✅ Prometheus (metrics storage)
- ✅ Grafana (visualization dashboard)

## 📁 Structure

```
otel-collector/
├── Dockerfile
└── otel-collector-config.yaml    # Routes telemetry to backends

loki/
├── Dockerfile
└── loki-config.yaml               # Log storage config

prometheus/
├── Dockerfile
└── prometheus.yml                 # Scrapes OTEL Collector

backend/
├── tracing.js                     # OpenTelemetry instrumentation
└── package.json                   # OTEL dependencies added
```

## 🏗️ Architecture

```
Backend → OTEL Collector → Loki (logs)
                        → Prometheus (metrics)
                        → Jaeger (traces - optional)
                        
All visualized in → Grafana
```

## 🔑 Access After Deployment

The script will show URLs for:
- **Grafana**: https://winonboard-grafana...
  - Login: admin / Admin@123
  - Add Prometheus and Loki data sources here

- **Prometheus**: https://winonboard-prometheus...
  - Direct metrics query interface

## 📖 Documentation

- [VENDOR_NEUTRAL_ARCHITECTURE.md](VENDOR_NEUTRAL_ARCHITECTURE.md) - Complete architecture explanation
- [LOGS_EXPLAINED.md](LOGS_EXPLAINED.md) - Why you need Loki for logs
- [OBSERVABILITY_SETUP.md](OBSERVABILITY_SETUP.md) - Detailed setup guide

## ✨ Why This Stack?

**Vendor-Neutral**:
- Backend only knows OTLP (OpenTelemetry Protocol)
- Switch from Loki to Elasticsearch? Just change OTEL Collector config
- Switch from Prometheus to Datadog? Just change OTEL Collector config
- **Zero application code changes**

## 🎯 What You Get

**Automatic Metrics**:
- HTTP request rates, latency, status codes
- MongoDB query duration
- Azure OpenAI API latency
- CPU, memory, event loop lag

**Automatic Logs**:
- All console.log output
- Structured with service name, timestamp
- Queryable with LogQL in Grafana

**Automatic Traces**:
- Request flow visualization
- Distributed tracing across services
- Performance bottleneck identification

## 🔧 Requirements

Before running the script:
- ✅ Azure CLI installed and logged in
- ✅ Container Apps Environment exists (winonboard-env)
- ✅ ACR exists (winonboard.azurecr.io)
- ✅ Backend already deployed

## 🆘 Troubleshooting

**Script fails during build:**
```powershell
# Ensure you're in the correct directory
cd D:\Winbuild_Deployments\Winbuild_Container_apps\winonboard_CAS
.\deploy-observability.ps1
```

**Can't access Grafana:**
- Wait 2-3 minutes after deployment for containers to start
- Check deployment: `az containerapp show --name winonboard-grafana --resource-group rg_pavan`

**Backend not sending telemetry:**
- Check OTEL_COLLECTOR_URL environment variable in backend
- View backend logs: `az containerapp logs show --name winonboard-backend --resource-group rg_pavan --tail 50`
