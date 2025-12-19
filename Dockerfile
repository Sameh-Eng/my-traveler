# Multi-stage Dockerfile for Next.js frontend
# Optimized production build with nginx serving

# =======================================
# Stage 1: Base Image
# =======================================
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# =======================================
# Stage 2: Build Stage
# =======================================
FROM base AS builder
WORKDIR /app

# Copy dependencies from base stage
COPY --from=base /app/node_modules ./node_modules/
COPY --from=base /app/package-lock.json ./package-lock.json
COPY --from=base /app/package*.json ./

# Copy source code
COPY . .

# Build the application
RUN npm run build
RUN mkdir -p public

# =======================================
# Stage 3: Production Build
# =======================================
FROM base AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set permissions
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Start the application as non-root user
USER nextjs

CMD ["node", "server.js"]

# =======================================
# Stage 4: Nginx Serving (Alternative)
# =======================================
FROM nginx:alpine AS nginx-production

# Install additional packages
RUN apk add --no-cache \
    curl \
    dumb-init

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from production stage
COPY --from=builder /app/.next/static /usr/share/nginx/html/.next/static
COPY --from=builder /app/public /usr/share/nginx/html/public

# Create a simple health check endpoint
RUN echo 'server {\n    listen 80;\n    server_name localhost;\n    location = /api/health {\n        return 200 "OK";\n        add_header Content-Type text/plain;\n    }\n}' > /etc/nginx/conf.d/health.conf

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN mkdir -p /var/cache/nginx && chown -R nginx:nginx /var/cache/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/api/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["/bin/sh", "-c", "dumb-init nginx -g 'daemon off;'"]