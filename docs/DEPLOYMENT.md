# MyTraveler Deployment Guide 🚀

This guide covers how to run the project locally and deploy it to production.

---

## 📋 Table of Contents

1. [Local Development](#local-development)
2. [Docker Development](#docker-development)
3. [Production Deployment (EC2)](#production-deployment-ec2)
4. [Production Deployment (ECS via GitHub Actions)](#production-deployment-ecs)
5. [Post-Deployment Configuration](#post-deployment-configuration)

---

## 🖥️ Local Development

### Prerequisites

- Node.js 18+
- Docker Desktop (for MySQL/Redis)
- npm or yarn

### Step 1: Start Dependencies (MySQL & Redis)

```bash
# Start MySQL and Redis containers
docker-compose up -d mysql redis
```

### Step 2: Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### Step 3: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:8082
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Runs on http://localhost:3000
```

### Step 4: Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8082/api
- **Health Check:** http://localhost:8082/health

---

## 🐳 Docker Development

### Run Everything in Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🌐 Production Deployment (EC2)

### Prerequisites

- AWS EC2 instance (Ubuntu 22.04 recommended)
- Minimum: t2.medium (2 vCPU, 4GB RAM)
- Security group with ports: 22, 80, 443

### Step 1: Prepare EC2 Instance

SSH to your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Step 2: Clone Repository

```bash
# Install git
sudo apt-get update && sudo apt-get install git -y

# Clone your repo
git clone https://github.com/YOUR_USERNAME/my-traveler-compyle-airline-booking-frontend.git
cd my-traveler-compyle-airline-booking-frontend
```

### Step 3: Run Deployment Script

```bash
sudo bash scripts/deploy-aws.sh
```

This script will:
- Install Docker & Docker Compose
- Configure firewall (UFW)
- Create necessary directories

### Step 4: Configure Environment

```bash
# Copy and edit production environment file
cp .env.prod .env

# Edit and update these values:
nano .env
```

**Update these critical values:**
- `DB_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Strong Redis password
- `JWT_SECRET` - Long random string
- `SESSION_SECRET` - Random string
- `GOOGLE_CALLBACK_URL` - `http://YOUR_EC2_IP/api/auth/callback/google`
- `CORS_ORIGIN` - `http://YOUR_EC2_IP`
- `NEXT_PUBLIC_API_URL` - `http://YOUR_EC2_IP/api`

### Step 5: Start Production Containers

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 6: Verify Deployment

```bash
# Check backend health
curl http://localhost:8080/health

# Check database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U mytraveler_user -d mytraveler -c "SELECT 1;"
```

### Step 7: Access Application

Your application is now available at:
- **Website:** http://YOUR_EC2_IP
- **API:** http://YOUR_EC2_IP/api

---

## 🚀 Production Deployment (ECS via GitHub Actions)

### Prerequisites

1. AWS Account with ECS, ECR, and Secrets Manager
2. GitHub repository with Actions enabled

### Step 1: Set Up AWS Resources

Run the AWS Secrets setup script locally:

```bash
./scripts/setup-aws-secrets.sh
```

### Step 2: Configure GitHub Secrets

Go to **Repository → Settings → Secrets → Actions** and add:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_ACCOUNT_ID` | Your AWS account ID |
| `AWS_REGION` | e.g., `us-east-1` |
| `ECS_CLUSTER_NAME` | ECS cluster name |
| `ECS_SERVICE_NAME` | ECS service name |
| `NEXT_PUBLIC_API_URL` | Production API URL |

See `docs/CI_CD_SECRETS.md` for complete list.

### Step 3: Push to Main Branch

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. Run tests
2. Build Docker images
3. Push to ECR
4. Deploy to ECS
5. Run health checks

### Step 4: Monitor Deployment

Go to **Actions** tab in GitHub to monitor progress.

---

## ⚙️ Post-Deployment Configuration

### 1. Update Google OAuth

Go to [Google Cloud Console](https://console.cloud.google.com/):

1. Navigate to **APIs & Services → Credentials**
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs:**
   ```
   http://YOUR_EC2_IP/api/auth/callback/google
   ```
4. Add to **Authorized JavaScript origins:**
   ```
   http://YOUR_EC2_IP
   ```

### 2. Enable Monitoring (Optional)

```bash
# Start with monitoring profile
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# Access Grafana
# http://YOUR_EC2_IP:3000 (default login: admin/GRAFANA_PASSWORD)
```

### 3. Set Up SSL (Recommended)

```bash
# Install certbot
sudo apt-get install certbot -y

# Get SSL certificate (you need a domain pointed to your EC2)
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/

# Update nginx config to use SSL
# Uncomment HTTPS section in docker-config/default.conf
```

---

## 🔧 Useful Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Operations

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U mytraveler_user -d mytraveler

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U mytraveler_user mytraveler > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U mytraveler_user mytraveler < backup.sql
```

---

## 🆘 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check if ports are in use
sudo lsof -i :8080
sudo lsof -i :3000
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# Check database credentials in .env
grep DB_ .env
```

### Health Check Failed

```bash
# Test backend directly
curl http://localhost:8080/health

# Check nginx config
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

---

## 📞 Support

If you encounter issues, check:
1. Container logs: `docker-compose logs`
2. Backend logs: `./logs/app.log`
3. Nginx logs: `./logs/nginx/`

---

**Happy Deploying! 🎉**
