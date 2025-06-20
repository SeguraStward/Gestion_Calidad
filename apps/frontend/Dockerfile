FROM node:lts-alpine AS base

# Environment variables for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Pruning stage
FROM base AS pruner
WORKDIR /app
COPY . .

# 1) Copy only root metadata and workspace config, package.json, and lockfile
COPY package.json pnpm-lock.yaml turbo.json pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json

# Install Turbo globally
RUN pnpm add -g turbo
RUN turbo prune @una-gc/frontend --docker

# Development dependencies stage
FROM base AS dev-deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Production dependencies stage
FROM base AS prod-deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/ .
COPY --from=pruner /app/out/full/ .
COPY turbo.json* ./
RUN pnpm turbo run build --filter=@una-gc/frontend...

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=prod-deps /app/ .

COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone/apps/frontend ./apps/frontend
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static        ./apps/frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/public              ./apps/frontend/public

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

ENV NEST_API=changeme
ENV NEST_API_PROD=changeme
ENV NEXT_PUBLIC_API_URL=changeme
ENV NODE_ENV=production

EXPOSE 80

CMD ["node", "apps/frontend/server.js"]