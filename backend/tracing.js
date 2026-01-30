const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');

// OpenTelemetry Collector endpoint
const OTEL_COLLECTOR_URL = process.env.OTEL_COLLECTOR_URL || 'http://winonboard-otel-collector.internal.gentlemeadow-8e12f1a7.westus2.azurecontainerapps.io:4318';

console.log('🔗 OpenTelemetry Collector URL:', OTEL_COLLECTOR_URL);

// OTLP exporters - send everything to OpenTelemetry Collector
const traceExporter = new OTLPTraceExporter({
  url: `${OTEL_COLLECTOR_URL}/v1/traces`,
});

const metricExporter = new OTLPMetricExporter({
  url: `${OTEL_COLLECTOR_URL}/v1/metrics`,
});

const logExporter = new OTLPLogExporter({
  url: `${OTEL_COLLECTOR_URL}/v1/logs`,
});

// Metric reader with periodic export
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000, // Export every 10 seconds
});

// Log processor
const logProcessor = new BatchLogRecordProcessor(logExporter);

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'winonboard-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'winonboard',
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'backend-1',
  }),
  traceExporter,
  metricReader,
  logRecordProcessor: logProcessor,
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable specific instrumentations if needed
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // File system can be noisy
      },
    }),
  ],
});

// Start the SDK
try {
  sdk.start();
  console.log('✅ OpenTelemetry initialized');
  console.log('📍 Service: winonboard-backend');
  console.log('🔗 Collector: ' + OTEL_COLLECTOR_URL);
  console.log('📊 Sending: Metrics, Traces, and Logs via OTLP');
  console.log('🔓 No vendor lock-in - data can be exported anywhere!');
} catch (error) {
  console.error('❌ OpenTelemetry initialization failed:', error);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('✅ OpenTelemetry shut down successfully'))
    .catch((error) => console.error('❌ Error shutting down OpenTelemetry:', error))
    .finally(() => process.exit(0));
});

module.exports = sdk;
