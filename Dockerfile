# Stage 1: Dependencies
# Lockfile generated on macOS lacks linux-x64-musl optional deps.
# Using `npm install` (not `npm ci`) lets npm resolve the correct
# platform-specific optional packages for Alpine/musl.
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack disable
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm install --prefer-offline

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack disable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx turbo build --filter=@igift/web

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
