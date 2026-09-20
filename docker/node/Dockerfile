FROM node:24.16.0-alpine AS builder

RUN npm install -g pnpm@11.6

WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instala as dependências
RUN pnpm install --frozen-lockfile

# Copia o código fonte
COPY . .

# Gera o Prisma Client e compila o projeto
RUN pnpm prisma generate && \
    pnpm run build

# Remove devDependencies to make the image smaller
RUN pnpm prune --prod

# Estágio 2: Production (Imagem limpa, menor)
FROM node:24.16.0-alpine

WORKDIR /usr/src/app

# Copia os artefatos compilados e dependências do estágio anterior
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

# Executa o projeto.
CMD ["node", "dist/main"]
