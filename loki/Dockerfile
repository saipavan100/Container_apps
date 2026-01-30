FROM grafana/loki:3.3.4

# Copy custom configuration
COPY loki-config.yaml /etc/loki/local-config.yaml

# Expose Loki port
EXPOSE 3100

# Run Loki
CMD ["-config.file=/etc/loki/local-config.yaml"]
