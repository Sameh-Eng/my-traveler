#!/bin/sh

# Docker entrypoint script for Node.js backend
# Handles environment setup and service startup

set -e

# Print startup banner
echo "============================================="
echo "🚀 Starting Paymob Backend Container"
echo "============================================="
echo "Node Version: $(node --version)"
echo "Environment: ${NODE_ENV:-development}"
echo "Port: ${PORT:-8080}"
echo "Paymob Mode: ${PAYMOB_MODE:-test}"
echo "Timestamp: $(date)"
echo "============================================="

# Create necessary directories
mkdir -p /app/logs /app/uploads /app/tmp

# Set proper permissions


# Check if required environment variables are set
if [ -z "$PAYMOB_API_KEY" ] && [ -z "$PAYMOB_TEST_API_KEY" ]; then
    echo "⚠️  WARNING: No Paymob API keys found. Please set PAYMOB_API_KEY or PAYMOB_TEST_API_KEY"
fi

# Verify package.json exists
if [ ! -f "/app/package.json" ]; then
    echo "❌ ERROR: package.json not found in /app"
    exit 1
fi

# Verify server.js exists
if [ ! -f "/app/server.js" ] && [ ! -f "/app/paymob-server.js" ]; then
    echo "❌ ERROR: server.js or paymob-server.js not found in /app"
    echo "Available files in /app:"
    ls -la /app/
    exit 1
fi

# Determine which server file to use
SERVER_FILE="server.js"
if [ ! -f "/app/server.js" ] && [ -f "/app/paymob-server.js" ]; then
    SERVER_FILE="paymob-server.js"
fi

echo "📋 Using server file: $SERVER_FILE"

# Database connection health check (optional)
if [ "$DB_HOST" ] && [ "$DB_USER" ]; then
    echo "🔍 Database configuration detected"
    echo "   Host: ${DB_HOST}"
    echo "   User: ${DB_USER}"
    echo "   Database: ${DB_NAME:-default}"
else
    echo "ℹ️  No database configuration found"
fi

# Paymob configuration check
echo "💳 Paymob Configuration:"
if [ "$PAYMOB_MODE" = "test" ]; then
    if [ "$PAYMOB_TEST_API_KEY" ]; then
        echo "   ✅ Test API Key: ${PAYMOB_TEST_API_KEY:0:8}..."
    else
        echo "   ❌ Test API Key: Not set"
    fi
    if [ "$PAYMOB_TEST_INTEGRATION_ID" ]; then
        echo "   ✅ Test Integration ID: $PAYMOB_TEST_INTEGRATION_ID"
    else
        echo "   ❌ Test Integration ID: Not set"
    fi
else
    if [ "$PAYMOB_API_KEY" ]; then
        echo "   ✅ Production API Key: ${PAYMOB_API_KEY:0:8}..."
    else
        echo "   ❌ Production API Key: Not set"
    fi
    if [ "$PAYMOB_INTEGRATION_ID" ]; then
        echo "   ✅ Production Integration ID: $PAYMOB_INTEGRATION_ID"
    else
        echo "   ❌ Production Integration ID: Not set"
    fi
fi

# URL configuration check
echo "🌐 URL Configuration:"
if [ "$PAYMOB_SUCCESS_URL" ]; then
    echo "   ✅ Success URL: $PAYMOB_SUCCESS_URL"
else
    echo "   ❌ Success URL: Not set"
fi
if [ "$PAYMOB_ERROR_URL" ]; then
    echo "   ✅ Error URL: $PAYMOB_ERROR_URL"
else
    echo "   ❌ Error URL: Not set"
fi
if [ "$PAYMOB_CALLBACK_URL" ]; then
    echo "   ✅ Callback URL: $PAYMOB_CALLBACK_URL"
else
    echo "   ❌ Callback URL: Not set"
fi



# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 2

# Health check function
health_check() {
    local max_attempts=30
    local attempt=1
    local health_url="http://localhost:${PORT:-8080}/health"

    echo "🏥 Performing health check..."

    while [ $attempt -le $max_attempts ]; do
        if wget --no-verbose --tries=1 --spider "$health_url" >/dev/null 2>&1; then
            echo "✅ Health check passed! Server is ready."
            return 0
        fi

        echo "   Attempt $attempt/$max_attempts: Server not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "❌ Health check failed after $max_attempts attempts"
    return 1
}

# Start the application
echo "🚀 Starting Node.js application..."

# Use exec to replace shell process with Node.js process
# This ensures proper signal handling and PID 1
exec node "$SERVER_FILE" &

# Store Node.js PID
NODE_PID=$!

echo "📱 Node.js process started with PID: $NODE_PID"

# Perform health check
if health_check; then
    echo "🎉 Application started successfully!"
    echo "📊 Health endpoint: http://localhost:${PORT:-8080}/health"
    echo "📖 API Documentation: http://localhost:${PORT:-8080}/api/paymob"
else
    echo "❌ Health check failed. Check application logs."
    # Kill the Node.js process if health check fails
    kill $NODE_PID 2>/dev/null || true
    exit 1
fi

# Wait for Node.js process to finish
wait $NODE_PID