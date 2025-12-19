# Multi-stage build for Node.js backend with Paymob integration
# Production-ready, optimized, and secure

# =======================================
# Stage 1: Build Stage
# =======================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install --omit=dev --ignore-scripts --no-audit

# Copy source code
COPY . .

# Create user for security
# User creation removed (not used in builder stage)

# =======================================
# Stage 2: Production Stage
# =======================================
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    supervisor

# Create non-root user for security
RUN addgroup -S nodejs && adduser -S -u 1001 -G nodejs nodejs

# Copy installed dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules/
COPY --from=builder --chown=nodejs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy application code
COPY --chown=nodejs:nodejs . .

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV PORT=8080
ENV PAYMOB_MODE=live

# Create directories and set permissions
RUN mkdir -p /app/logs /app/uploads /app/tmp && \
    chown -R nodejs:nodejs /app/logs /app/uploads /app/tmp

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# =======================================
# Final Runtime
# =======================================
FROM production AS final

# Expose port 8080 for direct backend access
EXPOSE 8080

# Copy entrypoint script
COPY docker-entrypoint.sh /entrypoint.sh

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Switch to non-root user
USER nodejs

# Start the application with dumb-init
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]