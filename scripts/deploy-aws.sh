#!/bin/bash
# ============================================
# MyTraveler Production Deployment Script
# For AWS EC2 Ubuntu Instance
# ============================================

set -e

echo "🚀 MyTraveler Production Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Please run as root (sudo)${NC}"
    exit 1
fi

# ============================================
# Step 1: System Update
# ============================================
echo -e "${GREEN}📦 Updating system...${NC}"
apt-get update && apt-get upgrade -y

# ============================================
# Step 2: Install Docker
# ============================================
echo -e "${GREEN}🐳 Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    usermod -aG docker ubuntu
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${YELLOW}Docker already installed${NC}"
fi

# ============================================
# Step 3: Install Docker Compose
# ============================================
echo -e "${GREEN}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${YELLOW}Docker Compose already installed${NC}"
fi

# ============================================
# Step 4: Create Application Directory
# ============================================
APP_DIR="/opt/mytraveler"
echo -e "${GREEN}📁 Setting up application directory...${NC}"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs
mkdir -p $APP_DIR/logs/nginx
mkdir -p $APP_DIR/uploads
mkdir -p $APP_DIR/ssl

# ============================================
# Step 5: Copy Environment File
# ============================================
echo -e "${GREEN}⚙️ Setting up environment...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${RED}❌ Please copy .env.prod to $APP_DIR/.env and update values!${NC}"
    echo "cp .env.prod $APP_DIR/.env"
    echo "nano $APP_DIR/.env"
fi

# ============================================
# Step 6: Configure Firewall
# ============================================
echo -e "${GREEN}🔥 Configuring firewall...${NC}"
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# ============================================
# Step 7: Install Certbot (Let's Encrypt)
# ============================================
echo -e "${GREEN}🔒 Installing Certbot for SSL...${NC}"
apt-get install -y certbot

# ============================================
# Deployment Instructions
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}✅ System prepared for deployment!${NC}"
echo "============================================"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Upload your code to the server:"
echo "   scp -r ./* ubuntu@YOUR_EC2_IP:$APP_DIR/"
echo ""
echo "2. SSH to your server and configure .env:"
echo "   ssh ubuntu@YOUR_EC2_IP"
echo "   cd $APP_DIR"
echo "   cp .env.prod .env"
echo "   nano .env  # Update all values"
echo ""
echo "3. Start the application:"
echo "   cd $APP_DIR"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "4. Get SSL certificate (if you have a domain):"
echo "   certbot certonly --standalone -d yourdomain.com"
echo "   # Copy certs to $APP_DIR/ssl/"
echo ""
echo "5. Monitor logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "============================================"
