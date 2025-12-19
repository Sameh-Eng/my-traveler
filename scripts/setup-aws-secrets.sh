#!/bin/bash
# ============================================
# AWS Secrets Manager Setup Script
# Creates all required secrets for MyTraveler
# ============================================

set -e

echo "🔐 MyTraveler AWS Secrets Manager Setup"
echo "========================================"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

# Configuration
PREFIX="/mytraveler/prod"
REGION="${AWS_REGION:-us-east-1}"

echo "📍 Region: $REGION"
echo "📂 Prefix: $PREFIX"
echo ""

# Function to create or update secret
create_secret() {
    local name=$1
    local value=$2
    local description=$3

    echo -n "Creating secret $PREFIX/$name... "
    
    # Check if secret exists
    if aws secretsmanager describe-secret --secret-id "$PREFIX/$name" --region "$REGION" &> /dev/null; then
        # Update existing secret
        aws secretsmanager put-secret-value \
            --secret-id "$PREFIX/$name" \
            --secret-string "$value" \
            --region "$REGION" > /dev/null
        echo "✅ Updated"
    else
        # Create new secret
        aws secretsmanager create-secret \
            --name "$PREFIX/$name" \
            --description "$description" \
            --secret-string "$value" \
            --region "$REGION" > /dev/null
        echo "✅ Created"
    fi
}

# Function to get secret ARN
get_secret_arn() {
    local name=$1
    aws secretsmanager describe-secret \
        --secret-id "$PREFIX/$name" \
        --region "$REGION" \
        --query 'ARN' \
        --output text
}

echo ""
echo "⚠️  Please enter your secret values:"
echo "   (Press Enter to skip, you can update later)"
echo ""

# Database secrets
read -p "DB Host (RDS endpoint): " DB_HOST
read -p "DB Name [mytraveler]: " DB_NAME
DB_NAME=${DB_NAME:-mytraveler}
read -p "DB User [mytraveler_user]: " DB_USER
DB_USER=${DB_USER:-mytraveler_user}
read -sp "DB Password: " DB_PASSWORD
echo ""

# Redis secrets
read -p "Redis Host (ElastiCache endpoint): " REDIS_HOST
read -sp "Redis Password: " REDIS_PASSWORD
echo ""

# JWT secret
read -sp "JWT Secret (long random string): " JWT_SECRET
echo ""

# Paymob secrets
read -p "Paymob API Key: " PAYMOB_API_KEY
read -p "Paymob Integration ID: " PAYMOB_INTEGRATION_ID
read -sp "Paymob HMAC Key: " PAYMOB_HMAC_KEY
echo ""

# Google OAuth secrets
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -sp "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# AviationStack API
read -p "AviationStack API Key: " AVIATIONSTACK_API_KEY

echo ""
echo "Creating secrets..."
echo ""

# Create database secrets
[ -n "$DB_HOST" ] && create_secret "db-host" "$DB_HOST" "Database host endpoint"
[ -n "$DB_NAME" ] && create_secret "db-name" "$DB_NAME" "Database name"
[ -n "$DB_USER" ] && create_secret "db-user" "$DB_USER" "Database username"
[ -n "$DB_PASSWORD" ] && create_secret "db-password" "$DB_PASSWORD" "Database password"

# Create Redis secrets
[ -n "$REDIS_HOST" ] && create_secret "redis-host" "$REDIS_HOST" "Redis host endpoint"
[ -n "$REDIS_PASSWORD" ] && create_secret "redis-password" "$REDIS_PASSWORD" "Redis password"

# Create JWT secret
[ -n "$JWT_SECRET" ] && create_secret "jwt-secret" "$JWT_SECRET" "JWT signing secret"

# Create Paymob secrets
[ -n "$PAYMOB_API_KEY" ] && create_secret "paymob-api-key" "$PAYMOB_API_KEY" "Paymob API key"
[ -n "$PAYMOB_INTEGRATION_ID" ] && create_secret "paymob-integration-id" "$PAYMOB_INTEGRATION_ID" "Paymob integration ID"
[ -n "$PAYMOB_HMAC_KEY" ] && create_secret "paymob-hmac-key" "$PAYMOB_HMAC_KEY" "Paymob HMAC key"

# Create Google OAuth secrets
[ -n "$GOOGLE_CLIENT_ID" ] && create_secret "google-client-id" "$GOOGLE_CLIENT_ID" "Google OAuth client ID"
[ -n "$GOOGLE_CLIENT_SECRET" ] && create_secret "google-client-secret" "$GOOGLE_CLIENT_SECRET" "Google OAuth client secret"

# Create AviationStack secret
[ -n "$AVIATIONSTACK_API_KEY" ] && create_secret "aviationstack-api-key" "$AVIATIONSTACK_API_KEY" "AviationStack API key"

echo ""
echo "============================================"
echo "✅ Secrets created successfully!"
echo "============================================"
echo ""
echo "📋 Add these Secret ARNs to GitHub Secrets:"
echo ""
echo "| GitHub Secret Name | AWS Secret ARN |"
echo "|-------------------|----------------|"

# Print ARNs
[ -n "$DB_HOST" ] && echo "| DB_HOST_ARN | $(get_secret_arn 'db-host') |"
[ -n "$DB_NAME" ] && echo "| DB_NAME_ARN | $(get_secret_arn 'db-name') |"
[ -n "$DB_USER" ] && echo "| DB_USER_ARN | $(get_secret_arn 'db-user') |"
[ -n "$DB_PASSWORD" ] && echo "| DB_PASSWORD_ARN | $(get_secret_arn 'db-password') |"
[ -n "$REDIS_HOST" ] && echo "| REDIS_HOST_ARN | $(get_secret_arn 'redis-host') |"
[ -n "$REDIS_PASSWORD" ] && echo "| REDIS_PASSWORD_ARN | $(get_secret_arn 'redis-password') |"
[ -n "$JWT_SECRET" ] && echo "| JWT_SECRET_ARN | $(get_secret_arn 'jwt-secret') |"
[ -n "$PAYMOB_API_KEY" ] && echo "| PAYMOB_API_KEY_ARN | $(get_secret_arn 'paymob-api-key') |"
[ -n "$PAYMOB_INTEGRATION_ID" ] && echo "| PAYMOB_INTEGRATION_ID_ARN | $(get_secret_arn 'paymob-integration-id') |"
[ -n "$PAYMOB_HMAC_KEY" ] && echo "| PAYMOB_HMAC_KEY_ARN | $(get_secret_arn 'paymob-hmac-key') |"
[ -n "$GOOGLE_CLIENT_ID" ] && echo "| GOOGLE_CLIENT_ID_ARN | $(get_secret_arn 'google-client-id') |"
[ -n "$GOOGLE_CLIENT_SECRET" ] && echo "| GOOGLE_CLIENT_SECRET_ARN | $(get_secret_arn 'google-client-secret') |"
[ -n "$AVIATIONSTACK_API_KEY" ] && echo "| AVIATIONSTACK_API_KEY_ARN | $(get_secret_arn 'aviationstack-api-key') |"

echo ""
echo "============================================"
echo "🎉 Setup complete!"
echo "============================================"
