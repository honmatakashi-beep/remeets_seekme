# ==============================================================================
# 🕊️ ReMEETs（再会のボトルメール）本番コンテナビルド定義 (Dockerfile)
# Multi-stage build for optimal image size and security
# ==============================================================================

# --- Stage 1: Build Frontend & Server Bundle ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools for native addons (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite frontend + esbuild server bundle
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache libc6-compat

# Create non-root user for enhanced container security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 remeets

COPY --from=builder /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=remeets:nodejs /app/dist ./dist

# Create persistent storage directory for SQLite database if used
RUN mkdir -p /app/data && chown -R remeets:nodejs /app/data

USER remeets

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
