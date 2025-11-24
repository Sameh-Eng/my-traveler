# MyTraveler - Docker Production Setup

Complete Docker configuration for the MyTraveler travel booking platform with production-ready deployment, monitoring, and security features.

## 🚀 Quick Start

### Production Deployment
```bash
# Clone and setup
git clone <repository>
cd my-traveler

# Setup environment
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
# Edit environment files with your configuration

# Deploy to production
make prod-build
make prod-up

# Check service health
make health
```

### Development Setup
```bash
# Quick start for developers
make quick-start

# Manual development setup
make dev-setup
make build
make dev
```

## 📋 Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| **Frontend** | 80/443 | Next.js application with nginx | `/health` |
| **Backend** | 8080 | Node.js API server | `/health` |
| **Database** | 5432 | PostgreSQL database | PostgreSQL ping |
| **Redis** | 6379 | Cache and session storage | Redis ping |
| **Nginx** | 80/443 | Load balancer and SSL termination | nginx config test |
| **Prometheus** | 9090 | Monitoring (optional) | `/metrics` |
| **Grafana** | 3001 | Monitoring dashboard (optional) | `/api/health` |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Internet      │───▶│     Nginx       │───▶│   Frontend      │
│   (HTTPS)       │    │  (Load Balancer)│    │  (Next.js)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Frontend      │───▶│    Backend      │
                       │   (Static)      │    │  (API Server)   │
                       └─────────────────┘    └─────────────────┘
                                                       │
                              ┌─────────────────────────┼─────────────────┐
                              ▼                         ▼                 ▼
                       ┌─────────────────┐    ┌─────────────────┐ ┌─────────────────┐
                       │   PostgreSQL    │    │     Redis       │ │   File Storage  │
                       │   (Database)    │    │     (Cache)     │ │    (Uploads)    │
                       └─────────────────┘    └─────────────────┘ └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

#### Backend Environment (.env)
```bash
# Application
NODE_ENV=production
PORT=8080

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=mytraveler
DB_USER=postgres
DB_PASSWORD=your_secure_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key

# Paymob Integration
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_integration_id
PAYMOB_HMAC_KEY=your_hmac_key
```

#### Frontend Environment (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_PAYMOB_IFRAME=https://accept.paymob.com/api/acceptance/iframes/your_iframe_id

# Application
NEXT_PUBLIC_APP_NAME=MyTraveler
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Docker Compose Files

- **docker-compose.yml** - Development environment
- **docker-compose.prod.yml** - Production environment with monitoring
- **docker-compose.yml.override.yml** - Development overrides

## 🛡️ Security Features

### Production Security
- **Non-root containers** - All services run as non-root users
- **Security headers** - CSP, HSTS, XSS protection
- **Rate limiting** - API endpoint protection
- **SSL/TLS** - HTTPS with strong ciphers
- **Network isolation** - Custom Docker networks
- **Health checks** - All services monitored

### Nginx Security Configuration
```nginx
# Security Headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

# Rate Limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=paymob:10m rate=5r/s;

# CSP for Paymob
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://accept.paymob.com; frame-src https://accept.paymob.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://accept.paymob.com;";
```

## 📊 Monitoring & Logging

### Prometheus Metrics
- **System metrics** - CPU, memory, disk usage
- **Application metrics** - Request rates, response times
- **Database metrics** - Connection pool, query performance
- **Redis metrics** - Cache hit rates, memory usage

### Grafana Dashboards
- **Application Overview** - System health and performance
- **Database Performance** - Query analysis and connections
- **User Activity** - Authentication and booking metrics
- **Payment Processing** - Paymob integration monitoring

### Log Management
```bash
# View all logs
make logs

# View service-specific logs
make logs-backend
make logs-frontend

# View recent errors
make logs-errors

# Real-time monitoring
docker-compose logs -f --tail=100
```

## 🚀 Deployment Commands

### Production Deployment
```bash
# Build production images
make prod-build

# Deploy with zero downtime
make deploy

# Full production deployment
make prod-deploy

# Health check after deployment
make health
```

### Zero-Downtime Deployment
```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Update backend and frontend
docker-compose -f docker-compose.prod.yml up -d --no-deps backend frontend

# Verify deployment
make health
```

## 🔍 Monitoring Commands

### Health Checks
```bash
# Check all services
make health

# Individual service checks
curl http://localhost:8080/health  # Backend
curl http://localhost:3000/health  # Frontend
```

### Resource Monitoring
```bash
# Resource usage
make stats

# Process list
make top

# Service inspection
make inspect
```

## 🗄️ Database Management

### PostgreSQL Operations
```bash
# Connect to database
make shell-db

# Create backup
make db-backup

# Restore from backup
make db-restore FILE=backup.sql

# Run migrations
make db-migrate
```

### Backup Strategy
```bash
# Automated daily backups
0 2 * * * cd /path/to/my-traveler && make db-backup

# Full system backup
make backup-all

# Restore all data
make restore-all
```

## 🔒 SSL Certificate Management

### SSL Setup
```bash
# Generate self-signed certificates (development)
make ssl-generate

# Setup Let's Encrypt (production)
make ssl-renew

# Manual SSL setup
mkdir -p nginx/ssl
# Add your certificates:
# - nginx/ssl/cert.pem
# - nginx/ssl/key.pem
# - nginx/ssl/chain.pem
```

### Certificate Renewal
```bash
# Automated renewal (cron)
0 3 * * * cd /path/to/my-traveler && make ssl-renew

# Manual renewal
make ssl-renew
```

## 🧪 Testing

### Test Commands
```bash
# Run all tests
make test

# Service-specific tests
make test-backend
make test-frontend

# CI/CD pipeline
make ci-test
```

### Quality Assurance
```bash
# Linting
make lint

# Code formatting
make format

# Security scanning
make security-check
```

## 📈 Performance Optimization

### Docker Optimization
```bash
# Optimize Docker resources
make optimize

# Clean up unused resources
make clean
make prune

# Rebuild with no cache
make rebuild
```

### Performance Tuning
- **Multi-stage builds** - Optimized image sizes
- **Layer caching** - Faster build times
- **Resource limits** - Prevent resource exhaustion
- **Health checks** - Automatic recovery

## 🔄 Development Workflow

### Local Development
```bash
# Start development environment
make dev

# View logs
make logs

# Access services
make shell-backend
make shell-db
```

### Code Quality
```bash
# Format code before commits
make format

# Run tests
make test

# Security check
make scan
```

## 🆘 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs [service-name]

# Check health
make health

# Restart services
docker-compose restart [service-name]
```

#### Database Connection Issues
```bash
# Check database health
docker-compose exec postgres pg_isready -U postgres

# Connect manually
docker-compose exec postgres psql -U postgres -d mytraveler
```

#### Performance Issues
```bash
# Check resource usage
make stats

# Monitor logs
make logs-errors

# System diagnostics
docker system df
```

### Emergency Procedures
```bash
# Full system reset
make reset

# Emergency backup
make backup-all

# Restore from backup
make restore-all
```

## 📚 Additional Documentation

- **Paymob Integration** - Payment processing configuration
- **API Documentation** - Backend API endpoints
- **Frontend Guide** - Next.js application structure
- **Monitoring Setup** - Prometheus and Grafana configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review logs with `make logs`
- Open an issue in the repository
- Contact the development team

---

**MyTraveler** - Your complete travel booking platform with production-ready Docker deployment.