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
COPY yarn.lock ./  # or package-lock.json for npm

# Install dependencies
RUN yarn install --frozen-lockfile --production --ignore-scripts

# Copy source code
COPY . .

# Create user for security
RUN addgroup -g nodejs && adduser -u 1000 -G nodejs node

# =======================================
# Stage 2: Production Stage
# =======================================
FROM node:18-alpine AS production

# Create app directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    supervisor \
    nginx

# Create non-root user for security
RUN addgroup -g nodejs && adduser -u 1000 -G nodejs node

# Copy installed dependencies from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules/
COPY --from=builder --chown=nodejs:nodejs /app/yarn.lock ./yarn.lock
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Copy application code
COPY --chown=nodejs:nodejs . .

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size-size=4096"
ENV PORT=3001
ENV PAYMOB_MODE=live

# Create directories for logs and uploads
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nodejs:nodejs /app/logs /app/uploads

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# =======================================
# Stage 3: Nginx Reverse Proxy
# =======================================
FROM nginx:alpine AS webserver

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from production stage
COPY --from=production /app /app

# Create non-root user
RUN addgroup -g nginx && adduser -u 1000 -G nginx nginx

# Set permissions
RUN chown -R nginx:nginx /app

# Configure dumb-init to use proper signals
RUN echo 'dumb init ubuntu sysvinit' > /etc/dumb-init

# Expose port 80 for nginx
EXPOSE 80

# Health check for nginx
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# =======================================
# Final Runtime
# =======================================
FROM production AS final

# Copy nginx from webserver
COPY --from=webserver /etc/nginx /etc/nginx
COPY --from=webserver /usr/lib/nginx/modules /usr/lib/nginx/modules

# Copy application from production stage
COPY --from=production /app /app

# Copy entrypoint script
COPY docker-entrypoint.sh /entrypoint.sh

# Make entrypoint executable
RUN chmod +x /entrypoint.sh

# Switch to non-root user
USER nodejs

# Expose port 8080 for direct backend access
EXPOSE 8080

# Start the application with dumb-init
ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]