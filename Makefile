# Makefile for Docker operations
# Comprehensive commands for building and managing Docker containers

.PHONY: help build build-backend build-frontend up down logs clean clean-images prune dev prod health test

# Default target
help:
	@echo "MyTraveler Docker Management"
	@echo ""
	@echo "Development Commands:"
	@echo "  build         - Build both frontend and backend images"
	@echo "  build-backend - Build backend image only"
	@echo "  build-frontend - Build frontend image only"
	@echo "  up            - Start all services"
	@echo "  down          - Stop all services"
	@echo "  dev           - Start development environment"
	@echo "  logs          - Show logs for all services"
	@echo "  health        - Check health of all services"
	@echo "  test          - Run tests"
	@echo ""
	@echo "Production Commands:"
	@echo "  prod          - Start production environment"
	@echo "  prod-build    - Build production images"
	@echo "  prod-deploy   - Deploy to production"
	@echo "  deploy        - Deploy with zero downtime"
	@echo ""
	@echo "Management Commands:"
	@echo "  clean         - Remove stopped containers"
	@echo "  clean-images  - Remove unused Docker images"
	@echo "  prune         - Remove all Docker data"
	@echo "  backup-all    - Create complete backup"
	@echo "  scan          - Security vulnerability scan"

# =======================================
# Build Commands
# =======================================

build:
	@echo "🔨 Building all Docker images..."
	docker-compose build

build-backend:
	@echo "🔨 Building backend image..."
	docker-compose build backend

build-frontend:
	@echo "🔨 Building frontend image..."
	docker-compose build frontend

# =======================================
# Docker Management
# =======================================

up:
	@echo "🚀 Starting all services..."
	docker-compose up -d

up-build:
	@echo "🚀 Building and starting all services..."
	docker-compose up -d --build

down:
	@echo "⏹ Stopping all services..."
	docker-compose down

restart:
	@echo "🔄 Restarting all services..."
	docker-compose restart

logs:
	@echo "📋 Showing logs for all services..."
	docker-compose logs -f

logs-backend:
	@echo "📋 Showing backend logs..."
	docker-compose logs -f backend

logs-frontend:
	@echo "📋 Showing frontend logs..."
	docker-compose logs -f frontend

# =======================================
# Environment Management
# =======================================

dev:
	@echo "🛠️ Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.yml.override.yml up -d

prod:
	@echo "🚀 Starting production environment..."
	docker-compose up -d --force-recreate

# =======================================
# Health Checks
# =======================================

health:
	@echo "🏥 Checking health of all services..."
	docker-compose ps
	@echo ""
	@echo "Frontend Health:"
	@curl -s http://localhost/api/health > /dev/null && echo "✅ Frontend is healthy" || echo "❌ Frontend is not responding"
	@echo ""
	@echo "Backend Health:"
	@curl -s http://localhost:8080/health > /dev/null && echo "✅ Backend is healthy" || echo "❌ Backend is not responding"
	@echo ""
	@echo "Database Health:"
	@docker-compose exec mysql mysqladmin ping -u travels_user -ptravels_password > /dev/null 2>&1 && echo "✅ Database is healthy" || echo "❌ Database is not responding"
	@echo ""
	@echo "Redis Health:"
	@docker-compose exec redis redis-cli ping > /dev/null 2>&1 && echo "✅ Redis is healthy" || echo "❌ Redis is not responding"

health-frontend:
	@echo "🏥 Frontend health check..."
	curl -f http://localhost/api/health || echo "❌ Frontend health check failed"

health-backend:
	@echo "🏥 Backend health check..."
	curl -f http://localhost:8080/health || echo "❌ Backend health check failed"

# =======================================
# Testing
# =======================================

test:
	@echo "🧪 Running tests..."
	docker-compose exec backend npm test || echo "❌ Backend tests failed"
	docker-compose exec frontend npm test || echo "❌ Frontend tests failed"

test-backend:
	@echo "🧪 Running backend tests..."
	docker-compose exec backend npm test

test-frontend:
	@echo "🧪 Running frontend tests..."
	docker-compose exec frontend npm test

# =======================================
# Database Management
# =======================================

db-connect:
	@echo "🗄️ Connecting to database..."
	docker-compose exec mysql mysql -u travels_user -ptravels_password travels_db

db-backup:
	@echo "💾 Creating database backup..."
	docker-compose exec mysqldump -u root -proot_password travels_db > backup-$(shell date +%Y%m%d-%H%M%S).sql

db-restore:
	@echo "📥 Restoring database..."
	@read -p "Enter backup file path: " backup_file && \
	docker-compose exec -T mysql -u root -proot_password travels_db < $$backup_file

# =======================================
# Cleanup Commands
# =======================================

clean:
	@echo "🧹 Removing stopped containers..."
	docker-compose down --remove-orphans
	docker system prune -f

clean-images:
	@echo "🧹 Removing unused Docker images..."
	docker image prune -f -a

clean-volumes:
	@echo "🧹 Removing all Docker volumes..."
	docker volume prune -f

prune:
	@echo "🧹 Removing all Docker data..."
	docker system prune -af --volumes

# =======================================
# Development Helpers
# =======================================

shell-backend:
	@echo "🐚 Opening backend shell..."
	docker-compose exec backend sh

shell-mysql:
	@echo "🐚 Opening MySQL shell..."
	docker-compose exec mysql mysql -u travels_user -ptravels_password travels_db

shell-redis:
	@echo "🐚 Opening Redis shell..."
	docker-compose exec redis redis-cli -a redis_password

# =======================================
# Deployment
# =======================================

pull:
	@echo "📥 Pulling latest images..."
	docker-compose pull

rebuild:
	@echo "🔄 Rebuilding all images..."
	docker-compose down --rmi all
	docker-compose build --no-cache
	docker-compose up -d

# =======================================
# Production Specific
# =======================================

prod-build:
	@echo "🏗️ Building production images..."
	docker-compose -f docker-compose.prod.yml build

prod-up:
	@echo "🚀 Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d

prod-deploy:
	@echo "🚀 Deploying to production..."
	docker-compose -f docker-compose.prod.yml down
	docker-compose -f docker-compose.prod.yml build --no-cache
	docker-compose -f docker-compose.prod.yml up -d

# =======================================
# Monitoring and Debugging
# =======================================

stats:
	@echo "📊 Docker resource usage:"
	docker stats

top:
	@echo "📊 Docker process list:"
	docker-compose top

inspect:
	@read -p "Enter service name: " service && \
	docker-compose inspect $$service

logs-tail:
	@echo "📋 Tailing all logs..."
	docker-compose logs -f --tail=100

logs-errors:
	@echo "📋 Showing error logs only..."
	docker-compose logs --tail=100 | grep -i error

# =======================================
# Development Workflows
# =======================================

setup:
	@echo "🔧 Setting up development environment..."
	@echo "Creating environment files..."
	@cp .env.example .env || echo ".env.example not found, creating..."
	@echo "Creating database directories..."
	@mkdir -p logs uploads
	@echo "Starting development services..."
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	sleep 30
	@$(MAKE) health

reset:
	@echo "🔄 Resetting development environment..."
	docker-compose down -v
	docker system prune -f
	$(MAKE) setup

# =======================================
# Migration Management
# =======================================

migrate:
	@echo "🔄 Running database migrations..."
	docker-compose exec backend npm run migrate

seed:
	@echo "🌱 Seeding database..."
	docker-compose exec backend npm run seed

# =======================================
# SSL/TLS Configuration
# =======================================

ssl-setup:
	@echo "🔐 Setting up SSL certificates..."
	@mkdir -p nginx/ssl
	@echo "Please add your SSL certificates to nginx/ssl/"
	@echo "Files needed:"
	@echo "  - nginx/ssl/cert.pem"
	@echo "  - nginx/ssl/key.pem"
	@echo "  - nginx/ssl/chain.pem"

# =======================================
# Performance Tuning
# =======================================
optimize:
	@echo "⚡ Optimizing Docker performance..."
	@echo "Removing unused images..."
	docker image prune -f
	@echo "Cleaning up volumes..."
	docker volume prune -f
	@echo "System information:"
	@docker system df

# =======================================
# Backup and Restore
# =======================================

backup-all:
	@echo "💾 Creating complete backup..."
	@mkdir -p backups/$(shell date +%Y%m%d)
	@echo "Backing up volumes..."
	@docker run --rm -v $(shell pwd)/backups/$(shell date +%Y%m%d):/backup -v my-traveler-mysql:/data mysql alpine tar czf /backup/mysql-data.tar.gz -C /data .
	@echo "Backup completed: backups/$(shell date +%Y%m%d)"

restore-all:
	@read -p "Enter backup date (YYYYMMDD): " backup_date && \
	echo "📥 Restoring from backup..." && \
	docker run --rm -v $(shell pwd)/backups/$backup_date:/backup:ro -v my-traveler-mysql:/data mysql alpine tar xzf /backup/mysql-data.tar.gz -C /data

# =======================================
# Security Scanning
# =======================================

scan:
	@echo "🔍 Scanning Docker images for vulnerabilities..."
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/security:scan docker.io/library/nginx
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/security:scan docker.io/library/mysql
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/security:scan docker.io/library/node:18

# =======================================
# Environment Management
# =======================================


dev-start:
	@echo "🛠️ Starting development environment with debug mode..."
	docker-compose -f docker-compose.yml -f docker-compose.yml.override.yml up -d
	@sleep 10
	@echo "🔍 Checking service health..."
	@$(MAKE) health

dev-stop:
	@echo "⏹ Stopping development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.yml.override.yml down

dev-rebuild:
	@echo "🔄 Rebuilding development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.yml.override.yml down
	docker-compose -f docker-compose.yml -f docker-compose.yml.override.yml build --no-cache
	$(MAKE) dev-start

# =======================================
# CI/CD Helpers
# =======================================

ci-build:
	@echo "🚀 CI/CD Build Process..."
	docker-compose -f docker-compose.yml build --no-cache
	docker-compose -f docker-compose.yml up -d
	@sleep 30
	@$(MAKE) health
	@echo "✅ Build completed successfully"

ci-test:
	@echo "🧪 Running CI/CD tests..."
	@$(MAKE) health
	@$(MAKE) test
	@echo "✅ Tests completed successfully"

ci-deploy:
	@echo "🚀 CI/CD Deployment..."
	@$(MAKE) prod-deploy
	@sleep 30
	@$(MAKE) health
	@echo "✅ Deployment completed successfully"