# ==============================================================================
# SIVORA AI E-Commerce - Production Frontend Dockerfile (Day 23)
# Multi-Stage Build: Node 20 (Build) -> Nginx Alpine (Ultra-light runtime ~25MB)
# ==============================================================================

# -------------------------------------------------------------
# Stage 1: Build Static Assets
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Optimize layer cache by copying package manifests first
COPY package.json package-lock.json ./
RUN npm ci

# Copy application sources
COPY . .

# Run production compilation & Vite bundling
RUN npm run build

# -------------------------------------------------------------
# Stage 2: High-Performance Production Web Server
# -------------------------------------------------------------
FROM nginx:1.25-alpine AS runner

# Remove default nginx static web page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with SPA routing and gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
