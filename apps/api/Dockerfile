# Thai School LMS - API Service (Production)
# Multi-stage build for minimal production image

# ─────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy workspace manifests
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --filter @school/api... --prod

# ─────────────────────────────────────────────
# Stage 2: Builder — compile TypeScript
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --filter @school/api...

# Copy source files
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# Generate Prisma client
RUN pnpm --filter @school/database generate

# Build the API
RUN pnpm --filter @school/api build

# ─────────────────────────────────────────────
# Stage 3: Production runner
# ─────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

# Copy runtime dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules 2>/dev/null || true

# Copy compiled output
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/generated ./packages/database/generated

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:4000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/api/dist/main"]
