# Stage 1: Build
# Single build stage to avoid cross-stage native binary resolution issues.
# Alpine uses musl libc; macOS-generated lockfile lacks musl optional deps.
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack disable

# Install deps
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm ci
# Force-install Alpine/musl native binaries not in the macOS lockfile.
# @parcel/watcher: needed by next-intl for file watching
# @next/swc: Next.js SWC compiler
# @swc/core: next-intl bundles its own @swc/core that needs musl native binding
RUN npm install --no-save --force \
    @parcel/watcher-linux-x64-musl \
    @next/swc-linux-x64-musl \
    @next/swc-linux-x64-gnu \
    @swc/core-linux-x64-musl \
    @swc/core-linux-x64-gnu

# Copy source and build
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
