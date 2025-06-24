FROM node:lts-alpine AS base

# Environment variables for pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

# Set working directory
WORKDIR /app

RUN npm install turbo --global
RUN npm install husky --global

COPY . .

RUN pnpm install --frozen-lockfile --prod
RUN turbo prune @una-gc/backend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/turbo.json turbo.json

COPY --from=builder /app/packages/database/prisma/schema/schema.prisma ./prisma/schema/schema.prisma
RUN mkdir -p ./prisma/schema/ && \
    if [ -d /app/packages/database/prisma/migrations ]; then \
      cp -r /app/packages/database/prisma/migrations ./prisma/schema/migrations; \
    else \
      echo "Migrations directory doesn't exist, skipping copy"; \
    fi

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app/apps/backend
RUN pnpm exec prisma db push \
      --schema=../../prisma/schema/schema.prisma \
      --skip-generate

WORKDIR /app

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo build --filter=@una-gc/backend --concurrency=1
RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=installer --chown=nestjs:nestjs /app .
# COPY --from=installer --chown=nestjs:nestjs /app/node_modules/.prisma  ./node_modules/.prisma
# COPY --from=installer --chown=nestjs:nestjs /app/node_modules/@prisma  ./node_modules/@prisma
# COPY --from=installer --chown=nestjs:nestjs /app/node_modules          ./node_modules
# COPY --from=installer --chown=nestjs:nestjs /app/dist                  ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "apps/backend/dist/main.js"]