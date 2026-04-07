# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
# Disable Corepack — it misinterprets "packageManager": "npm@10.8.0"
# as a Yarn config, breaking lockfile patching and registry lookups.
RUN corepack disable
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
# npm ci installs what the lockfile specifies. The lockfile was generated
# on macOS so it's missing linux-musl optional deps. We install them
# explicitly afterwards.
RUN npm ci
RUN npm install --no-save @parcel/watcher-linux-x64-musl @next/swc-linux-x64-musl 2>/dev/null || true

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
