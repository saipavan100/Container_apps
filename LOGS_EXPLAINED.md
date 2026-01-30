# Quick Reference: Logs in OpenTelemetry Architecture

## ❌ Why You CAN'T Send Logs Directly to Grafana

**Grafana = Visualization Tool (Not a Database)**

```
Backend → Grafana  ❌
         (Where to store logs?)
```

Think of it like:
- **Grafana** = Web browser
- **Loki/Elasticsearch** = Database
- You need BOTH

## ✅ Correct Architecture

```
Backend → OTEL Collector → Loki (stores logs) → Grafana (displays logs)
```

## 🏗️ Complete Flow

```
┌─────────────┐
│   Backend   │  Your application generates logs
└──────┬──────┘
       │ OTLP (OpenTelemetry Protocol)
       ↓
┌─────────────┐
│ OTEL        │  Receives, processes, routes logs
│ Collector   │
└──────┬──────┘
       │ HTTP Push
       ↓
┌─────────────┐
│    Loki     │  Stores logs in database
└──────┬──────┘
       │ LogQL Query
       ↓
┌─────────────┐
│   Grafana   │  Displays logs in UI
└─────────────┘
```

## 📦 Components You Need

| Component | What It Does | Can Be Replaced? |
|-----------|--------------|------------------|
| **Backend** | Generates logs | - |
| **OTEL Collector** | Routes logs | ✅ No (stays vendor-neutral) |
| **Loki** | Stores logs | ✅ Yes (→ Elasticsearch, Splunk, etc) |
| **Grafana** | Displays logs | ✅ Yes (→ Kibana, Splunk UI, etc) |

## 🎯 Your Stack Options

### Option 1: Vendor-Neutral (Recommended)
```
Backend → OTEL Collector → Loki → Grafana
```
**Why**: Can replace Loki/Grafana anytime without changing backend

### Option 2: Azure-Only (Vendor Lock-in)
```
Backend → Azure Log Analytics → Azure Portal
```
**Why NOT**: Locked to Azure, can't switch clouds

### Option 3: No OTEL Collector (Vendor Lock-in)
```
Backend → Loki → Grafana
```
**Why NOT**: Backend hardcoded to Loki, can't switch easily

## 🔄 What Happens If You Want to Switch

### Without OTEL Collector:
```
Backend (sends to Loki) → Want to use Elasticsearch instead?
❌ Change backend code
❌ Rebuild backend
❌ Redeploy backend
❌ Downtime
```

### With OTEL Collector:
```
Backend (sends to OTEL) → Want to use Elasticsearch instead?
✅ Change otel-collector-config.yaml only
✅ Rebuild OTEL Collector
✅ Redeploy OTEL Collector
✅ Backend unchanged, no downtime
```

## 📊 Storage Backend Comparison

| Backend | Type | Best For | Cloud Native | Cost |
|---------|------|----------|--------------|------|
| **Grafana Loki** | Label-based | High volume logs | ✅ Yes | Low |
| **Elasticsearch** | Full-text search | Complex queries | ⚠️ Medium | High |
| **Azure Log Analytics** | Cloud service | Azure-only | ⚠️ Azure | Medium |
| **Splunk** | Enterprise | Compliance | ❌ No | Very High |
| **Clickhouse** | Column store | Analytics | ✅ Yes | Low |

## 🚀 Deploy Your Stack

```powershell
# Deploys: OTEL Collector + Loki + Prometheus + Grafana
.\deploy-full-observability.ps1
```

This creates:
- ✅ Backend sends to OTEL Collector (vendor-neutral)
- ✅ OTEL Collector routes to Loki (logs), Prometheus (metrics)
- ✅ Grafana visualizes everything
- ✅ Can replace any component without changing backend

## 📝 Query Your Logs

After deployment, in Grafana:

### LogQL Examples:

**All logs from backend:**
```logql
{service_name="winonboard-backend"}
```

**Only errors:**
```logql
{service_name="winonboard-backend"} |= "error"
```

**Last 5 minutes with filter:**
```logql
{service_name="winonboard-backend"} 
  |= "MongoDB" 
  | json 
  | line_format "{{.timestamp}} {{.message}}"
```

**Error rate:**
```logql
sum(rate({service_name="winonboard-backend"} |= "error" [5m]))
```

## 🎓 Key Concepts

**OTLP**: OpenTelemetry Protocol (vendor-neutral standard)
**Loki**: Log aggregation system (lightweight Elasticsearch alternative)
**LogQL**: Loki Query Language (similar to PromQL)
**Cardinality**: Number of unique label combinations (keep low for cost)

## ✅ Your Deployment

Run one command:
```powershell
.\deploy-full-observability.ps1
```

Gets you:
1. ✅ OpenTelemetry Collector (port 4318)
2. ✅ Loki (port 3100, internal)
3. ✅ Prometheus (port 9090, external)
4. ✅ Grafana (port 3000, external)
5. ✅ Backend updated to use OTEL Collector

**Result**: Complete vendor-neutral observability! 🎉
