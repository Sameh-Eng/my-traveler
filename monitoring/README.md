# MyTraveler - Monitoring Setup Guide

This guide provides comprehensive instructions for setting up Prometheus and Grafana monitoring for the MyTraveler travel booking platform.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Prometheus Setup](#prometheus-setup)
- [Grafana Setup](#grafana-setup)
- [Dashboard Configuration](#dashboard-configuration)
- [Metrics Collection](#metrics-collection)
- [Alerting](#alerting)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The MyTraveler monitoring stack includes:

- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and alerting
- **Exporters**: System and application metrics
- **Dashboards**: Pre-built monitoring dashboards

### Monitoring Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MyTraveler    │───▶│   Prometheus    │───▶│     Grafana     │
│   Applications  │    │   (Metrics)     │    │   (Dashboards)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Node Exporter  │    │  PostgreSQL     │    │   Alerting      │
│ (System Metrics)│    │   Exporter      │    │   Manager       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## ✅ Prerequisites

### System Requirements

- **Docker**: 20.10+ and Docker Compose 2.0+
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Port access 9090 (Prometheus), 3001 (Grafana)

### Environment Files

Create required environment files:

```bash
# Create monitoring environment file
cat > monitoring/.env << EOF
# Prometheus Configuration
PROMETHEUS_PORT=9090
PROMETHEUS_RETENTION=30d
PROMETHEUS_STORAGE_SIZE=10GB

# Grafana Configuration
GRAFANA_PORT=3001
GRAFANA_USER=admin
GRAFANA_PASSWORD=your_secure_grafana_password
GRAFANA_SECRET_KEY=your_grafana_secret_key_here

# Database Configuration
DB_NAME=mytraveler
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Exporter Ports
NODE_EXPORTER_PORT=9100
POSTGRES_EXPORTER_PORT=9187
REDIS_EXPORTER_PORT=9121
BLACKBOX_EXPORTER_PORT=9115
NGINX_EXPORTER_PORT=9113
CADVISOR_PORT=8080
STATSD_EXPORTER_PORT=9102
EOF

# Create application metrics environment
cat > .env.monitoring << EOF
# Application Metrics
NODE_ENV=production
APP_VERSION=1.0.0

# Paymob (for payment metrics)
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_HMAC_KEY=your_hmac_key

# CORS
NEXT_PUBLIC_API_URL=https://yourdomain.com
EOF
```

## 🚀 Quick Start

### 1. Start Monitoring Stack

```bash
# Navigate to project root
cd my-traveler

# Start all monitoring services
docker-compose -f monitoring/exporters/docker-compose.yml up -d

# Start main application with monitoring
docker-compose -f docker-compose.complete.yml --profile monitoring up -d
```

### 2. Access Monitoring Services

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/GRAFANA_PASSWORD)
- **Node Exporter**: http://localhost:9100/metrics
- **PostgreSQL Exporter**: http://localhost:9187/metrics

### 3. Verify Setup

```bash
# Check all services are running
docker-compose -f monitoring/exporters/docker-compose.yml ps

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check Grafana health
curl http://localhost:3001/api/health
```

## 📊 Prometheus Setup

### Running Prometheus in Docker

#### Method 1: Docker Compose (Recommended)

```bash
# Start Prometheus with configuration
docker run -d \
  --name prometheus \
  --network booking-net \
  -p 9090:9090 \
  -v $(pwd)/monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro \
  -v prometheus_data:/prometheus \
  prom/prometheus:latest \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/prometheus \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.console.templates=/etc/prometheus/consoles \
  --storage.tsdb.retention.time=30d \
  --web.enable-lifecycle
```

#### Method 2: Docker Compose with Full Stack

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: mytraveler-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - booking-net
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'

volumes:
  prometheus_data:

networks:
  booking-net:
    external: true
```

### Prometheus Configuration Details

The `prometheus.yml` configuration includes:

#### Global Settings
```yaml
global:
  scrape_interval: 15s      # How often to scrape targets
  evaluation_interval: 15s  # How often to evaluate rules
```

#### Scrape Configurations
- **Backend API**: `/metrics` endpoint at `backend:8080`
- **Node Exporter**: System metrics at `node-exporter:9100`
- **PostgreSQL Exporter**: Database metrics at `postgres-exporter:9187`
- **Redis Exporter**: Cache metrics at `redis-exporter:9121`
- **Blackbox Exporter**: External monitoring at `blackbox-exporter:9115`

#### Advanced Features
- **Relabeling**: Custom labels for better metric organization
- **Metric Filtering**: Remove high-cardinality metrics
- **Remote Write**: Long-term storage integration
- **Alerting**: Integration with Alertmanager

## 📈 Grafana Setup

### Running Grafana in Docker

```bash
# Start Grafana with persistent storage
docker run -d \
  --name grafana \
  --network booking-net \
  -p 3001:3000 \
  -e GF_SECURITY_ADMIN_USER=admin \
  -e GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD} \
  -e GF_USERS_ALLOW_SIGN_UP=false \
  -v grafana_data:/var/lib/grafana \
  -v $(pwd)/monitoring/grafana/provisioning:/etc/grafana/provisioning:ro \
  -v $(pwd)/monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro \
  grafana/grafana:latest
```

### Grafana Configuration

#### 1. Add Prometheus Data Source

```bash
# Create data source configuration
cat > monitoring/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
    jsonData:
      timeInterval: "5s"
      queryTimeout: "60s"
      httpMethod: "POST"
    secureJsonData: {}
EOF
```

#### 2. Import Dashboards

```bash
# Create dashboard provisioning
cat > monitoring/grafana/provisioning/dashboards/dashboards.yml << EOF
apiVersion: 1

providers:
  - name: 'mytraveler-dashboards'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    options:
      path: /var/lib/grafana/dashboards
EOF
```

#### 3. Access Grafana

- **URL**: http://localhost:3001
- **Username**: admin
- **Password**: Set in `GRAFANA_PASSWORD` environment variable

## 📋 Dashboard Configuration

### Available Dashboards

#### 1. API Performance Dashboard (`mytraveler-api-performance`)
- **Response Time**: Average API latency by endpoint
- **Request Rate**: Requests per second by method and route
- **Error Rate**: 4xx and 5xx error percentages
- **95th Percentile**: Response time distribution
- **Status Codes**: HTTP status code distribution

#### 2. System Metrics Dashboard (`mytraveler-system-metrics`)
- **CPU Usage**: Total and per-core utilization
- **Memory Usage**: Used, cached, and available memory
- **Disk Usage**: Filesystem utilization
- **Network I/O**: Network interface throughput
- **Load Average**: System load indicators

#### 3. Business Metrics Dashboard (`mytraveler-business-metrics`)
- **Flight Bookings**: Bookings per minute
- **Payment Success Rate**: Transaction success percentage
- **Revenue**: Total revenue tracking
- **Active Users**: Concurrent user sessions
- **Conversion Funnel**: User journey metrics

### Importing Dashboards

#### Method 1: Automatic Import (Provisioning)

Dashboards are automatically imported when Grafana starts due to provisioning configuration.

#### Method 2: Manual Import

1. Navigate to Grafana UI
2. Go to **Dashboard** → **Import**
3. Upload JSON files from `monitoring/grafana/dashboards/`
4. Configure data source and import

### Customizing Dashboards

#### Variables

Add variables for dynamic filtering:

```json
{
  "templating": {
    "list": [
      {
        "name": "instance",
        "type": "query",
        "datasource": "${DS_PROMETHEUS}",
        "query": "label_values(up, instance)"
      },
      {
        "name": "service",
        "type": "query",
        "datasource": "${DS_PROMETHEUS}",
        "query": "label_values(http_requests_total, service)"
      }
    ]
  }
}
```

#### Alerting Rules

Add alert rules to dashboards:

```json
{
  "alerting": {
    "conditions": [
      {
        "evaluator": {
          "params": [
            95
          ],
          "type": "gt"
        },
        "operator": {
          "type": "and"
        },
        "query": {
          "params": [
            "A",
            "5m",
            "now"
          ]
        },
        "reducer": {
          "params": [],
          "type": "last"
        },
        "type": "query"
      }
    ],
    "frequency": "60s",
    "handler": 1,
    "name": "High API Latency",
    "message": "API response time is above 95th percentile threshold"
  }
}
```

## 📊 Metrics Collection

### Application Metrics

#### Backend API Metrics

Add metrics collection to your Node.js backend:

```javascript
// Install prometheus client
npm install prom-client

// metrics.js
const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

// Business metrics
const flightBookingsTotal = new client.Counter({
  name: 'mytraveler_flight_bookings_total',
  help: 'Total number of flight bookings',
  labelNames: ['destination', 'booking_type'],
  registers: [register]
});

const paymentAttemptsTotal = new client.Counter({
  name: 'mytraveler_payment_attempts_total',
  help: 'Total payment attempts',
  labelNames: ['payment_method', 'status'],
  registers: [register]
});

const revenueTotal = new client.Counter({
  name: 'mytraveler_revenue_total',
  help: 'Total revenue generated',
  labelNames: ['booking_type', 'currency'],
  registers: [register]
});

const activeUsersTotal = new client.Gauge({
  name: 'mytraveler_active_users_total',
  help: 'Number of currently active users',
  registers: [register]
});

// Middleware to track requests
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestsTotal
      .labels(req.method, route, res.statusCode, 'mytraveler-backend')
      .inc();

    httpRequestDuration
      .labels(req.method, route, res.statusCode, 'mytraveler-backend')
      .observe(duration);
  });

  next();
}

// Metrics endpoint
function metricsEndpoint(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
}

module.exports = {
  register,
  metricsMiddleware,
  metricsEndpoint,
  flightBookingsTotal,
  paymentAttemptsTotal,
  revenueTotal,
  activeUsersTotal
};
```

#### Express.js Integration

```javascript
// app.js
const express = require('express');
const { metricsMiddleware, metricsEndpoint } = require('./metrics');

const app = express();

// Add metrics middleware before routes
app.use(metricsMiddleware);

// Your existing routes
app.get('/api/flights', (req, res) => {
  // Your flight search logic
});

app.post('/api/bookings', (req, res) => {
  // Your booking logic
  // Update business metrics
  flightBookingsTotal.labels(req.body.destination, req.body.class).inc();
  revenueTotal.labels(req.body.class, 'USD').inc(req.body.amount);
});

// Add metrics endpoint
app.get('/metrics', metricsEndpoint);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Exporter Configuration

#### PostgreSQL Exporter Queries

Create custom queries for PostgreSQL metrics:

```yaml
# monitoring/postgres-exporter/queries.yml
# PostgreSQL custom queries for MyTraveler

- name: "mytraveler.bookings.stats"
  query: |
    SELECT
      COUNT(*) as total_bookings,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
      SUM(total_amount) as total_revenue
    FROM bookings
    WHERE created_at >= NOW() - INTERVAL '1 hour'
  metrics:
    - total_bookings:
        usage: "GAUGE"
        description: "Total number of bookings in the last hour"
    - confirmed_bookings:
        usage: "GAUGE"
        description: "Confirmed bookings in the last hour"
    - pending_bookings:
        usage: "GAUGE"
        description: "Pending bookings in the last hour"
    - cancelled_bookings:
        usage: "GAUGE"
        description: "Cancelled bookings in the last hour"
    - total_revenue:
        usage: "GAUGE"
        description: "Total revenue in the last hour"

- name: "mytraveler.users.stats"
  query: |
    SELECT
      COUNT(*) as total_users,
      COUNT(CASE WHEN last_login >= NOW() - INTERVAL '1 hour' THEN 1 END) as active_users_1h,
      COUNT(CASE WHEN last_login >= NOW() - INTERVAL '24 hours' THEN 1 END) as active_users_24h
    FROM users
  metrics:
    - total_users:
        usage: "GAUGE"
        description: "Total number of users"
    - active_users_1h:
        usage: "GAUGE"
        description: "Active users in the last hour"
    - active_users_24h:
        usage: "GAUGE"
        description: "Active users in the last 24 hours"
```

## 🚨 Alerting

### Prometheus Alerting Rules

Create alerting rules:

```yaml
# monitoring/prometheus/rules/alerts.yml
groups:
  - name: mytraveler.rules
    rules:
      # API Performance Alerts
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="mytraveler-backend"}[5m])) by (le, method, route)) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"
          description: "95th percentile latency for {{ route }} is {{ $value }}s"

      - alert: HighErrorRate
        expr: sum(rate(http_requests_total{service="mytraveler-backend",status=~"5.."}[5m])) / sum(rate(http_requests_total{service="mytraveler-backend"}[5m])) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # System Resource Alerts
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value }}%"

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value }}%"

      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes{fstype!="tmpfs"} / node_filesystem_size_bytes{fstype!="tmpfs"})) * 100 > 85
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space on {{ $labels.mountpoint }}"
          description: "Disk usage is {{ $value }}%"

      # Business Metrics Alerts
      - alert: LowBookingRate
        expr: sum(increase(mytraveler_flight_bookings_total[1h])) < 10
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low booking rate"
          description: "Only {{ $value }} bookings in the last hour"

      - alert: PaymentFailureRateHigh
        expr: (sum(increase(mytraveler_payment_failed_total[5m])) / sum(increase(mytraveler_payment_attempts_total[5m]))) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High payment failure rate"
          description: "Payment failure rate is {{ $value | humanizePercentage }}"

      # Database Alerts
      - alert: PostgreSQLDown
        expr: up{job="postgres-exporter"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL database is not responding"

      - alert: PostgreSQLTooManyConnections
        expr: pg_stat_database_numbackends{datname="mytraveler"} > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL too many connections"
          description: "PostgreSQL has {{ $value }} connections"

      # Application Health Alerts
      - alert: ApplicationDown
        expr: up{job="mytraveler-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "MyTraveler backend is down"
          description: "The MyTraveler backend application is not responding"
```

### Grafana Alerting

Configure alerts in Grafana dashboards:

#### API Latency Alert
- **Metric**: `http_request_duration_seconds`
- **Condition**: 95th percentile > 500ms
- **For**: 5 minutes
- **Notification**: Email/Slack

#### Error Rate Alert
- **Metric**: `http_requests_total{status=~"5.."}`
- **Condition**: Error rate > 5%
- **For**: 2 minutes
- **Notification**: Email/Slack

#### Booking Rate Alert
- **Metric**: `mytraveler_flight_bookings_total`
- **Condition**: Rate < 1 booking/minute
- **For**: 10 minutes
- **Notification**: Email/Slack

## 🔧 Troubleshooting

### Common Issues

#### Prometheus Not Scraping Targets

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check specific target
curl http://localhost:8080/metrics  # Backend metrics
curl http://localhost:9100/metrics  # Node exporter
```

**Solutions:**
1. Verify network connectivity: `docker network ls`
2. Check service health: `docker-compose ps`
3. Review Prometheus configuration
4. Check firewall rules

#### Grafana Not Connecting to Prometheus

```bash
# Test Prometheus endpoint from Grafana container
docker exec grafana curl http://prometheus:9090/api/v1/query?query=up

# Check Grafana logs
docker logs grafana
```

**Solutions:**
1. Verify data source configuration
2. Check network connectivity
3. Restart Grafana service
4. Update data source settings

#### Missing Metrics

```bash
# Check if metrics are available
curl -s http://localhost:8080/metrics | grep mytraveler

# Check Prometheus query
curl "http://localhost:9090/api/v1/query?query=mytraveler_flight_bookings_total"
```

**Solutions:**
1. Verify application metrics are exposed
2. Check Prometheus scrape configuration
3. Review application logs for errors
4. Ensure metrics are properly instrumented

#### High Memory Usage

```bash
# Check Prometheus memory usage
docker stats prometheus

# Check TSDB size
docker exec prometheus du -sh /prometheus
```

**Solutions:**
1. Reduce retention period
2. Implement metric filtering
3. Add remote write configuration
4. Increase memory limits

### Performance Optimization

#### Prometheus Optimization

```yaml
# prometheus.yml optimizations
global:
  scrape_interval: 30s        # Reduce scrape frequency
  evaluation_interval: 30s    # Reduce rule evaluation

# Remote write for long-term storage
remote_write:
  - url: "http://cortex:9009/api/v1/push"
    queue_config:
      max_samples_per_send: 1000
      max_shards: 200
```

#### Grafana Optimization

```bash
# Grafana configuration optimizations
GF_DATABASE_MAX_OPEN_CONN=10
GF_DATABASE_MAX_IDLE_CONN=5
GF_SESSION_PROVIDER=redis
GF_LOG_LEVEL=warn
```

#### Metric Reduction

```yaml
# Metric filtering in prometheus.yml
metric_relabel_configs:
  # Drop high-cardinality metrics
  - source_labels: [__name__]
    regex: 'http_request_duration_seconds_bucket.*le="[0-9]+\.[0-9]+e\-[0-9]+"'
    action: drop
```

### Monitoring Commands

```bash
# Check system health
docker-compose -f monitoring/exporters/docker-compose.yml ps

# View logs
docker-compose -f monitoring/exporters/docker-compose.yml logs -f prometheus
docker-compose -f monitoring/exporters/docker-compose.yml logs -f grafana

# Check Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health, lastError: .lastError}'

# Check Grafana data sources
curl -s -u admin:$GRAFANA_PASSWORD http://localhost:3001/api/datasources | jq '.[] | {name: .name, type: .type, url: .url}'

# Backup Prometheus data
docker run --rm -v mytraveler_prometheus_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/prometheus-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .

# Restore Prometheus data
docker run --rm -v mytraveler_prometheus_data:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/prometheus-backup.tar.gz -C /data
```

### Monitoring Best Practices

1. **Regular Backups**: Backup Prometheus and Grafana data
2. **Log Monitoring**: Monitor application logs alongside metrics
3. **Capacity Planning**: Monitor storage usage and plan for growth
4. **Security**: Secure monitoring endpoints with authentication
5. **Documentation**: Keep dashboards and alerts documented

---

## 📞 Support

For monitoring setup issues:

1. Check the troubleshooting section above
2. Review Prometheus and Grafana documentation
3. Check application logs for metric collection errors
4. Verify network connectivity between services

The monitoring stack provides comprehensive visibility into the MyTraveler platform's performance, reliability, and business metrics. Regular monitoring and alerting ensure proactive issue detection and resolution.