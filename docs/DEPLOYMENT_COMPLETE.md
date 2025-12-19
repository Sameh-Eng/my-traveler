# 🚀 MyTraveler Complete Deployment Guide

> **Last Updated:** December 19, 2025  
> **Author:** Deployment Team

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [AWS EC2 Setup](#aws-ec2-setup)
3. [Deployment Steps](#deployment-steps)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Monitoring Setup](#monitoring-setup)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance Commands](#maintenance-commands)

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure you have:

| Item | Status |
|------|--------|
| AWS Account | ⬜ |
| EC2 Instance (t2.medium or larger) | ⬜ |
| Security Group configured (ports 22, 80, 443) | ⬜ |
| SSH Key (.pem file) | ⬜ |
| Domain name (optional but recommended) | ⬜ |
| Google OAuth credentials updated | ⬜ |
| Paymob credentials (for payments) | ⬜ |

---

## 🖥️ AWS EC2 Setup

### Step 1: Launch EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. Choose settings:
   - **Name:** `mytraveler-production`
   - **AMI:** Ubuntu Server 22.04 LTS
   - **Instance Type:** `t3.medium` (recommended) or `t3.small` (minimum)
   - **Key Pair:** Select an existing key pair or click **"Create new key pair"**.
     - **Key pair name:** `mytraveler-key`
     - **Key pair type:** RSA
     - **Private key file format:** `.pem` (recommended for OpenSSH/macOS/Linux)
     - **Note:** Download and store this file safely. You will not be able to download it again once the instance is created.
   - **Storage:** 30GB gp3 (minimum)

### Step 2: Configure Security Group

Create or edit security group with these rules:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | My IP | SSH access (update when IP changes) |
| HTTP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | 443 | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | 3001 | 0.0.0.0/0 | Grafana (optional) |
| Custom TCP | 9090 | 0.0.0.0/0 | Prometheus (optional) |

> **💡 Dynamic IP Solutions:**
> 
> If your IP changes frequently:
> 
> **Option 1: Open to all (simplest but less secure)**
> - Set SSH source to `0.0.0.0/0` but use strong key-based authentication
> 
> **Option 2: Update IP manually**
> - Go to EC2 → Security Groups → Edit Inbound Rules
> - Click "My IP" to auto-detect your current IP
> 
> **Option 3: Use AWS Instance Connect (Recommended)**
> - No need to manage IPs - connect directly from AWS Console
> - EC2 → Instances → Select instance → Click "Connect" → "EC2 Instance Connect"
> 
> **Option 4: Use VPN with static IP**
> - Services like NordVPN or Tailscale provide static IPs


### Step 3: Allocate Elastic IP (Recommended)

An Elastic IP gives your instance a **permanent public IP** that doesn't change when you restart.

**Allocate the IP:**
1. Go to **EC2 → Elastic IPs** (in left sidebar under "Network & Security")
2. Click **"Allocate Elastic IP address"**
3. Leave all settings as default (Amazon's pool selected)
4. Click **"Allocate"** button

**Associate with your instance:**
1. Select your new Elastic IP (click checkbox)
2. Click **Actions → Associate Elastic IP address**
3. Choose:
   - **Resource type:** Instance
   - **Instance:** Select your `mytraveler-production` instance
   - **Private IP:** Leave as default
4. Click **"Associate"**

> **💰 Cost:** Free while associated with a running instance. Only charges (~$4/month) if allocated but unused.

---

## 📦 Deployment Steps

### Step 1: Connect to EC2

```bash
# Make key readable
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Step 2: Install Docker & Docker Compose

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
rm get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# IMPORTANT: Log out and back in for group changes
exit
```

### Step 3: Clone Repository

```bash
# Reconnect
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Clone repository
git clone https://github.com/YOUR_USERNAME/my-traveler-compyle-airline-booking-frontend.git
cd my-traveler-compyle-airline-booking-frontend
```

### Step 4: Configure Environment

```bash
# Copy production environment file
cp .env.prod .env

# Edit environment variables
nano .env
```

**CRITICAL: Update these values in `.env`:**

```bash
# Replace YOUR_EC2_IP with your actual EC2 public IP or domain
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD
JWT_SECRET=YOUR_VERY_LONG_RANDOM_STRING_AT_LEAST_64_CHARACTERS
SESSION_SECRET=ANOTHER_RANDOM_STRING
COOKIE_SECRET=ANOTHER_RANDOM_STRING

# Google OAuth - VERY IMPORTANT
GOOGLE_CALLBACK_URL=http://YOUR_EC2_IP/api/auth/callback/google

# CORS and API URLs
CORS_ORIGIN=http://YOUR_EC2_IP
NEXT_PUBLIC_API_URL=http://YOUR_EC2_IP/api
```

**Generate strong passwords:**
```bash
# Generate random passwords
openssl rand -base64 32  # For DB_PASSWORD
openssl rand -base64 32  # For REDIS_PASSWORD
openssl rand -base64 64  # For JWT_SECRET
```

### Step 5: Create Required Directories

```bash
mkdir -p logs logs/nginx uploads ssl
chmod 755 logs logs/nginx uploads ssl
```

### Step 6: Build and Start Services

```bash
# Build images (first time only, takes ~5 minutes)
docker-compose -f docker-compose.prod.yml build

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

**Expected output:**
```
NAME                       STATUS          PORTS
Flights                    Up (healthy)    5432/tcp
redis                      Up (healthy)    6379/tcp
mytraveler-backend-prod    Up (healthy)    8080/tcp
mytraveler-frontend-prod   Up              3000/tcp
mytraveler-nginx-prod      Up              80->80, 443->443
```

### Step 7: Verify Deployment

```bash
# Check health endpoint
curl http://localhost/health
# Should return: OK

# Check backend API
curl http://localhost/api/health
# Should return: {"success":true,"message":"Backend API is running",...}

# Check from external (on your local machine)
curl http://YOUR_EC2_IP/health
```

---

## ⚙️ Post-Deployment Configuration

### Update Google OAuth Console

**CRITICAL:** Update Google Cloud Console with production URLs.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services → Credentials**
3. Click on your OAuth 2.0 Client ID
4. Update:

**Authorized JavaScript origins:**
```
http://YOUR_EC2_IP
https://YOUR_EC2_IP (if using SSL)
https://yourdomain.com (if using domain)
```

**Authorized redirect URIs:**
```
http://YOUR_EC2_IP/api/auth/callback/google
https://YOUR_EC2_IP/api/auth/callback/google (if using SSL)
https://yourdomain.com/api/auth/callback/google (if using domain)
```

5. Click **Save**
6. Wait 5-10 minutes for changes to propagate

### Verify Database Connection

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U mytraveler_user -d mytraveler

# Check tables
\dt

# Should show:
#  Schema |   Name   | Type  |     Owner
# --------+----------+-------+---------------
#  public | bookings | table | mytraveler_user
#  public | users    | table | mytraveler_user

# Exit
\q
```

---

## 📊 Monitoring Setup (Grafana & Prometheus)

### Why They Weren't Running

Grafana and Prometheus are set with `profiles: monitoring` in docker-compose, meaning they only start when you explicitly request them.

### Start Monitoring Services

```bash
# Start with monitoring profile
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# Verify they're running
docker-compose -f docker-compose.prod.yml ps | grep -E "grafana|prometheus"
```

### Access Monitoring Dashboards

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Grafana | http://YOUR_EC2_IP:3001 | admin / (GRAFANA_PASSWORD from .env) |
| Prometheus | http://YOUR_EC2_IP:9090 | None |

**Note:** Add port 3001 and 9090 to your EC2 Security Group if accessing externally.

### Configure Grafana

1. Open http://YOUR_EC2_IP:3001
2. Login with admin / your_grafana_password
3. Go to **Configuration → Data Sources → Add data source**
4. Select **Prometheus**
5. URL: `http://prometheus:9090`
6. Click **Save & Test**

### Create Prometheus Config

```bash
# Create prometheus config directory
mkdir -p monitoring

# Create prometheus.yml
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: /metrics

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
EOF
```

---

## 🔒 SSL/HTTPS Configuration

### Option 1: Let's Encrypt (Free SSL)

**Prerequisites:** You need a domain name pointing to your EC2 IP.

```bash
# Install Certbot
sudo apt-get install certbot -y

# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
sudo chown ubuntu:ubuntu ssl/*

# Update nginx config for SSL
cat > docker-config/default.conf << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # ... rest of config
}
EOF

# Start nginx
docker-compose -f docker-compose.prod.yml up -d nginx
```

### Option 2: AWS Certificate Manager (ACM) + ALB

For production, consider using:
- AWS Application Load Balancer (ALB)
- AWS Certificate Manager for free SSL
- This also provides better scaling and availability

---

## 🔧 Troubleshooting

### Check Logs

```bash
# All logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Common Issues

| Issue | Solution |
|-------|----------|
| **502 Bad Gateway** | Backend not healthy. Check `docker logs mytraveler-backend-prod` |
| **Database connection failed** | Verify DB_PASSWORD in .env matches in docker-compose |
| **Google OAuth error** | Update redirect URI in Google Console |
| **Port 80 in use** | `sudo lsof -i :80` and stop conflicting service |
| **Container keeps restarting** | Check logs: `docker logs <container-name>` |

### Restart Services

```bash
# Restart everything
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# Full rebuild
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Database Reset (Caution!)

```bash
# WARNING: This deletes all data!
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔄 Maintenance Commands

### Daily Operations

```bash
# Check status
docker-compose -f docker-compose.prod.yml ps

# View resource usage
docker stats

# View logs (last 100 lines)
docker-compose -f docker-compose.prod.yml logs --tail=100
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U mytraveler_user mytraveler > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U mytraveler_user mytraveler < backup_20251219.sql
```

### Clean Up Docker

```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes (CAREFUL!)
docker volume prune
```

---

## 📱 Quick Reference Card

### Start/Stop Commands

```bash
# Start all
docker-compose -f docker-compose.prod.yml up -d

# Start with monitoring
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# Stop all
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart
```

### URLs

| Service | URL |
|---------|-----|
| Website | http://YOUR_EC2_IP |
| API | http://YOUR_EC2_IP/api |
| Health | http://YOUR_EC2_IP/health |
| Grafana | http://YOUR_EC2_IP:3001 (if monitoring enabled) |

### Important Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables |
| `docker-compose.prod.yml` | Docker services configuration |
| `docker-config/default.conf` | Nginx configuration |
| `logs/` | Application logs |

---

## 🎉 Deployment Complete!

Your MyTraveler application is now running in production!

**Need help?** Check the logs first:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

---

*Good luck with your deployment! 🚀*
