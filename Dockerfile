# Stage 1: Build
# Uses node:20-slim (Debian/glibc) so that macOS- or Linux-generated lockfiles
# are compatible and we can use `npm ci` for reproducible, locked installs.
# Alpine (musl) caused npm to fail with cross-platform optional-dep issues
# (https://github.com/npm/cli/issues/4828), requiring lockfile deletion —
# which defeated reproducibility and introduced supply-chain risk.
FROM node:20-slim AS builder
WORKDIR /app

RUN corepack disable

# Install deps with the lockfile — reproducible, deterministic builds.
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/
RUN npm ci

# Copy source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx turbo build --filter=@igift/web

# Stage 2: Production
FROM node:20-slim AS runner
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
