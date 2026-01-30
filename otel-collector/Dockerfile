FROM otel/opentelemetry-collector-contrib:0.93.0

# Copy custom configuration
COPY otel-collector-config.yaml /etc/otelcol-contrib/config.yaml

# Expose ports
# 4317 - OTLP gRPC receiver
# 4318 - OTLP HTTP receiver
# 9464 - Prometheus metrics exporter
# 8888 - Collector's own metrics
# 13133 - Health check
# 55679 - zPages (debugging)
EXPOSE 4317 4318 9464 8888 13133 55679

# Run collector
CMD ["--config=/etc/otelcol-contrib/config.yaml"]
