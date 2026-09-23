# syntax=docker/dockerfile:1
ARG NODE_VERSION=24.16.0

# base: Node + pnpm + openssl (exigido pelo Prisma no Alpine)
FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION=11.6.0
ENV CI=true \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN apk add --no-cache openssl \
 && npm install -g pnpm@${PNPM_VERSION}
WORKDIR /usr/src/app

# DEPS: instala dependências (camada cacheada pelo lockfile)
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# BUILD: gera o Prisma Client e compila
FROM deps AS build
COPY . .
RUN pnpm prisma generate && pnpm build

# MIGRATOR: aplica migrations e seeds (usado pelo compose)
FROM build AS migrator
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm prisma db seed"]

# PROD-DEPS: remove devDependencies
FROM build AS prod-deps
RUN pnpm prune --prod --ignore-scripts

# RUNTIME: imagem final enxuta, sem root
FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
RUN apk add --no-cache openssl
WORKDIR /usr/src/app
COPY --from=prod-deps --chown=node:node /usr/src/app/package.json ./
COPY --from=prod-deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=prod-deps --chown=node:node /usr/src/app/dist ./dist
COPY --from=prod-deps --chown=node:node /usr/src/app/prisma ./prisma
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
