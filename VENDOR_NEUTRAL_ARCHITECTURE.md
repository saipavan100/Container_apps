# Vendor-Neutral Observability Stack Architecture

## ✅ Why This Architecture is Vendor-Neutral

Your application uses **OpenTelemetry Collector** as the central telemetry pipeline. This means:

- ✅ **Application code never knows about Prometheus, Loki, or any specific backend**
- ✅ **All telemetry sent via standard OTLP protocol** (OpenTelemetry Protocol)
- ✅ **Change monitoring tools without touching application code**
- ✅ **Add multiple backends simultaneously** (e.g., send to both Prometheus and Datadog)
- ✅ **Future-proof**: Switch tools as technology evolves

## 🏗️ Complete Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Backend Application                           │
│                    (OpenTelemetry SDK Instrumented)                  │
│                                                                       │
│  - Express routes, MongoDB, HTTP calls auto-instrumented            │
│  - Generates: Metrics, Traces, Logs                                 │
│  - Export Protocol: OTLP (OpenTelemetry Protocol)                   │
│  - Export Destination: OTEL Collector ONLY                          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                │ OTLP/HTTP (Port 4318)
                                │ ├─ Metrics
                                │ ├─ Traces  
                                │ └─ Logs
                                ↓
┌──────────────────────────────────────────────────────────────────────┐
│             OpenTelemetry Collector (Central Hub)                    │
│                    Container: winonboard-otel-collector              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📥 RECEIVERS (collect telemetry)                                    │
│     ├─ otlp (gRPC):  Port 4317                                      │
│     └─ otlp (HTTP):  Port 4318  ← Backend sends here               │
│                                                                       │
│  ⚙️ PROCESSORS (transform/filter data)                              │
│     ├─ batch:           Buffer data for efficiency                  │
│     ├─ memory_limiter:  Prevent OOM crashes                         │
│     ├─ resource:        Add metadata (environment, cluster)         │
│     └─ attributes:      Modify/enrich telemetry                     │
│                                                                       │
│  📤 EXPORTERS (send to storage backends)                            │
│     ├─ prometheus:      Export metrics → Port 9464/metrics          │
│     ├─ loki:           Export logs → Loki HTTP API                  │
│     └─ otlp/jaeger:    Export traces → Jaeger (optional)           │
│                                                                       │
└──────┬────────────────────┬─────────────────────┬────────────────────┘
       │                    │                     │
       │ Metrics            │ Logs                │ Traces
       │ (Prometheus        │ (Loki HTTP API)     │ (OTLP)
       │  format)           │                     │
       ↓                    ↓                     ↓
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│ Prometheus  │     │    Loki     │     │ Jaeger/Tempo    │
│  (Metrics   │     │   (Logs     │     │   (Traces       │
│   Storage)  │     │   Storage)  │     │    Storage)     │
│             │     │             │     │                 │
│ Port: 9090  │     │ Port: 3100  │     │ Port: 16686     │
│ Ingress:    │     │ Ingress:    │     │ Ingress:        │
│  External   │     │  Internal   │     │  External       │
└──────┬──────┘     └──────┬──────┘     └────────┬────────┘
       │                   │                     │
       │ Query API         │ Query API           │ Query API
       │ (PromQL)          │ (LogQL)             │ (Jaeger UI)
       └───────────────────┴─────────────────────┘
                           │
                           ↓
               ┌───────────────────────┐
               │       Grafana         │
               │   (Visualization)     │
               │                       │
               │  Data Sources:        │
               │  ├─ Prometheus        │
               │  ├─ Loki              │
               │  └─ Tempo/Jaeger      │
               │                       │
               │  Port: 3000           │
               │  Ingress: External    │
               │  Login: admin/Admin@  │
               └───────────────────────┘
```

## 🔌 Port Mapping

| Component | Container App Name | Port | Protocol | Purpose | Ingress |
|-----------|-------------------|------|----------|---------|---------|
| Backend API | winonboard-backend | 8080 | HTTP | Application endpoints | External |
| OTEL Collector | winonboard-otel-collector | 4317 | gRPC | OTLP receiver (gRPC) | Internal |
| OTEL Collector | winonboard-otel-collector | 4318 | HTTP | OTLP receiver (HTTP) | Internal |
| OTEL Collector | winonboard-otel-collector | 9464 | HTTP | Prometheus exporter | Internal |
| OTEL Collector | winonboard-otel-collector | 8888 | HTTP | Collector own metrics | Internal |
| OTEL Collector | winonboard-otel-collector | 13133 | HTTP | Health check | Internal |
| Loki | winonboard-loki | 3100 | HTTP | Log ingestion API | Internal |
| Prometheus | winonboard-prometheus | 9090 | HTTP | Query API & Web UI | External |
| Grafana | winonboard-grafana | 3000 | HTTP | Dashboard UI | External |

## 📊 Data Flow Examples

### Example 1: HTTP Request Journey

```
1. User requests: GET /api/candidates
   ↓
2. Backend Express handles request
   ↓
3. OpenTelemetry auto-instrumentation captures:
   - Metric: http_server_duration_ms (100ms)
   - Trace: Span with duration, status, attributes
   - Log: "GET /api/candidates 200 OK"
   ↓
4. Backend sends to OTEL Collector via OTLP:
   POST http://winonboard-otel-collector:4318/v1/metrics
   POST http://winonboard-otel-collector:4318/v1/traces
   POST http://winonboard-otel-collector:4318/v1/logs
   ↓
5. OTEL Collector processes:
   - Batches data
   - Adds resource attributes (environment=production)
   - Routes to appropriate exporters
   ↓
6. Exports:
   - Metric → Prometheus (scraped from :9464/metrics)
   - Trace → Jaeger/Tempo (via OTLP)
   - Log → Loki (pushed via HTTP)
   ↓
7. User views in Grafana:
   - Dashboard queries Prometheus: rate(http_server_requests_total[5m])
   - Dashboard queries Loki: {service_name="winonboard-backend"}
   - Dashboard queries Tempo: trace ID lookup
```

### Example 2: MongoDB Query Journey

```
1. Backend queries MongoDB: db.candidates.find()
   ↓
2. OpenTelemetry Mongoose instrumentation captures:
   - Metric: mongodb_operation_duration (50ms)
   - Trace: MongoDB span (parent: HTTP request span)
   - Log: "MongoDB query executed: candidates.find"
   ↓
3. Sent to OTEL Collector (same flow as above)
   ↓
4. Visible in Grafana:
   - P95 MongoDB latency chart
   - Slow query logs filtered
   - Trace showing HTTP → MongoDB dependency
```

## 🔄 Why This is Vendor-Neutral

### Without OTEL Collector (Vendor Lock-in):
```javascript
// Backend code directly exports to Prometheus
const prometheusExporter = new PrometheusExporter({ port: 9464 });

// To switch to Datadog, you must:
// 1. Change backend code
// 2. npm install datadog packages
// 3. Rebuild Docker image
// 4. Redeploy container
```

### With OTEL Collector (Vendor-Neutral):
```javascript
// Backend code only knows about OTLP
const otlpExporter = new OTLPExporter({
  url: 'http://otel-collector:4318'
});

// To switch to Datadog:
// 1. Add datadog exporter to otel-collector-config.yaml
// 2. Rebuild OTEL Collector image only
// 3. Backend code unchanged! ✅
```

## 🎯 Real-World Scenario: Switching Backends

### Scenario: You want to use Datadog instead of Prometheus

**Without OTEL Collector:**
- ❌ Change backend/tracing.js (remove Prometheus exporter)
- ❌ Add Datadog SDK to backend/package.json
- ❌ npm install in backend
- ❌ Rebuild backend image
- ❌ Redeploy backend container
- ❌ Update all environment variables
- ⚠️ **Downtime required**

**With OTEL Collector:**
- ✅ Edit otel-collector-config.yaml:
```yaml
exporters:
  datadog:
    api:
      key: ${DATADOG_API_KEY}
      site: datadoghq.com

service:
  pipelines:
    metrics:
      exporters: [datadog]  # Changed from [prometheus]
```
- ✅ Rebuild OTEL Collector image
- ✅ Redeploy OTEL Collector container
- ✅ **Backend unchanged, zero downtime**

### Scenario: Send to BOTH Prometheus and Datadog

```yaml
service:
  pipelines:
    metrics:
      exporters: [prometheus, datadog]  # Send to both!
```

No application changes needed!

## 🛡️ Additional Benefits

### 1. Cost Optimization
Filter expensive data before storage:
```yaml
processors:
  filter/expensive:
    metrics:
      exclude:
        match_type: regexp
        metric_names:
          - high_cardinality_metric_.*  # Drop expensive metrics
```

### 2. Sampling for High Traffic
Sample traces to reduce costs:
```yaml
processors:
  probabilistic_sampler:
    sampling_percentage: 10  # Keep only 10% of traces
```

### 3. PII Scrubbing
Remove sensitive data:
```yaml
processors:
  attributes:
    actions:
      - key: email
        action: delete  # Remove email from telemetry
```

### 4. Multi-Region Export
Send to different backends per region:
```yaml
exporters:
  prometheus/us:
    endpoint: us-prometheus:9090
  prometheus/eu:
    endpoint: eu-prometheus:9090
```

## 📝 Summary

**Question**: Why can't I send logs directly to Grafana?
**Answer**: Grafana is a visualization tool, not a database. It needs a storage backend.

**Question**: Why use OTEL Collector instead of direct export?
**Answer**: Vendor-neutrality. Change backends without changing application code.

**Your Stack**:
- **Backend** → OTLP → **OTEL Collector** → **Storage** → **Grafana**
- Storage options: Prometheus (metrics), Loki (logs), Tempo/Jaeger (traces)
- All replaceable without touching backend code!

**Deploy Command**:
```powershell
.\deploy-full-observability.ps1
```

This creates a production-ready, vendor-neutral observability stack! 🚀
