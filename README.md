<div align="center">

# ⚡ GoodWe Service App

API de recarga de veículos elétricos — estações, sessões de carga, pagamentos (PIX e cartão) e telemetria.

![Node](https://img.shields.io/badge/Node-24.16-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11.6-F69220?logo=pnpm&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?logo=redis&logoColor=white)

</div>

---

## Sumário

- [Stack](#stack)
- [Início rápido](#início-rápido)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados (Prisma)](#banco-de-dados-prisma)
- [Docker](#docker)
- [Testes](#testes)
- [Scripts](#scripts)
- [CI/CD](#cicd)
- [Estrutura](#estrutura)
- [Segurança](#segurança)

---

## Stack

| Camada          | Tecnologia                                    |
| --------------- | --------------------------------------------- |
| Runtime         | Node.js 24.16 · pnpm 11.6                     |
| Framework       | NestJS 11 + Fastify 5 · Swagger               |
| Banco           | MySQL 8.4 · Prisma 6                          |
| Cache / limites | Redis 7.4 (cache-manager + throttler)         |
| Logs            | Pino (`nestjs-pino`) com correlation id       |
| Pagamentos      | Mercado Pago (PIX e cartão)                   |
| Qualidade       | Vitest · ESLint · Prettier · Husky            |

---

## Início rápido

**Pré-requisitos:** Node 24.16+, pnpm 11.6+ e Docker. Com [asdf](https://asdf-vm.com), basta `asdf install` (lê o `.tool-versions`).

```bash
# 1. Dependências
pnpm install

# 2. Variáveis de ambiente
cp .env.example .env              # defina DB_PASSWORD e os segredos JWT

# 3. MySQL + Redis
pnpm infra:up

# 4. Banco: migrations + seeds
pnpm prisma:migrate:deploy
pnpm prisma:seed

# 5. API em modo watch
pnpm start:dev
```

| Recurso   | URL                                     |
| --------- | --------------------------------------- |
| API       | http://localhost:3000/api               |
| Swagger   | http://localhost:3000/api/swagger       |
| Liveness  | http://localhost:3000/api/health/live   |
| Readiness | http://localhost:3000/api/health/ready (só localhost) |

---

## Variáveis de ambiente

Todas estão documentadas no [`.env.example`](./.env.example) e são **validadas na inicialização** (`src/config/env.validation.ts`) — se algo obrigatório faltar, a API não sobe e diz exatamente o quê.

| Grupo        | Variáveis principais                                               |
| ------------ | ------------------------------------------------------------------ |
| Aplicação    | `NODE_ENV`, `PORT`, `API_PREFIX`, `LOG_LEVEL`                      |
| Banco        | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DATABASE_URL` |
| Redis        | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_TLS` |
| JWT          | `JWT_APP_*`, `JWT_WEB_*`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
| Rate limit   | `THROTTLE_TTL_*`, `THROTTLE_LIMIT_*` (short / medium / long)       |
| Mercado Pago | `MERCADO_PAGO_*`                                                   |
| Telemetria   | `TELEMETRY_API_URL`, `TELEMETRY_API_KEY`                           |

A `DATABASE_URL` é montada a partir das variáveis `DB_*` usando `${VAR}` — a expansão funciona no Nest (`expandVariables`), no Prisma CLI e no Docker Compose.

> **Senhas com caracteres especiais** (`@ : / # ? %`) precisam de URL-encoding dentro da `DATABASE_URL`.
> **Bancos gerenciados** (ex.: Aiven) exigem `?sslaccept=strict` na URL; Redis gerenciado (ex.: Upstash) exige `REDIS_TLS=true`.

---

## Banco de dados (Prisma)

- Schema: `prisma/schema.prisma` · Migrations: `prisma/migrations/` · Seeds: `prisma/seeds/` (idempotentes, via `upsert`).
- O `PrismaService` lê a URL do `ConfigService`, reconecta com retry na subida (até 5 tentativas) e fecha a conexão no shutdown.
- Pool de conexões: ajuste com `?connection_limit=10&pool_timeout=20` na `DATABASE_URL`.

```bash
pnpm prisma:migrate:dev --name add_algo   # cria migration a partir do schema (dev)
pnpm prisma:migrate:deploy                # aplica migrations pendentes (CI / produção)
pnpm prisma:seed                          # popula tabelas de domínio (+ estações fora de produção)
pnpm prisma:studio                        # interface visual do banco
pnpm prisma:migrate:reset                 # ⚠️ apaga tudo e recria (apenas dev)
```

---

## Docker

O `compose.yml` tem quatro serviços:

| Serviço   | Função                                                            |
| --------- | ----------------------------------------------------------------- |
| `mysql`   | MySQL 8.4 com volume persistente e healthcheck                    |
| `redis`   | Redis 7.4 com AOF, limite de memória e senha opcional             |
| `migrate` | Roda uma vez: `migrate deploy` + `db seed`, depois encerra        |
| `api`     | Imagem de produção; só sobe depois do banco migrado               |

```bash
pnpm infra:up      # só mysql + redis (desenvolvimento com pnpm start:dev)
pnpm docker:up     # stack completa com build
pnpm docker:logs   # logs da API
pnpm infra:down    # derruba tudo (volumes são mantidos)
```

A imagem (`docker/node/Dockerfile`) é multi-stage: `deps → build → migrator | prod-deps → runtime`. A final roda como usuário `node`, sem devDependencies.

---

## Testes

| Tipo       | Arquivos             | Comando          | Precisa de banco? |
| ---------- | -------------------- | ---------------- | ----------------- |
| Unitários  | `*.spec.ts`          | `pnpm test`      | Não               |
| Integração | `*.int.spec.ts`      | `pnpm test:int`  | Sim               |
| E2E        | `*.e2e.spec.ts`      | `pnpm test:e2e`  | Sim               |

Os testes de integração **apagam as tabelas**, por isso usam um banco separado:

```bash
cp .env.test.example .env.test    # DB_NAME=goodwe_test
pnpm test:int                     # aplica as migrations no banco de teste e roda
```

Uma trava impede rodar contra um banco cujo nome não contenha `test`. Cobertura: `pnpm test:cov` (relatório em `coverage/`).

---

## Scripts

| Script                   | Descrição                                   |
| ------------------------ | ------------------------------------------- |
| `start:dev`              | API em watch mode                           |
| `build` / `start:prod`   | Build (SWC) e execução de produção          |
| `lint` / `lint:fix`      | ESLint (verificação / correção)             |
| `format` / `format:check`| Prettier (escrita / verificação)            |
| `typecheck`              | `tsc --noEmit`                              |
| `test*`                  | Vitest (unit, int, e2e, cobertura e CI)     |
| `prisma:*`               | generate, format, validate, migrate, seed, studio |
| `infra:*` / `docker:*`   | Atalhos do Docker Compose                   |

**Git hooks (Husky):** `pre-commit` roda ESLint + Prettier nos arquivos alterados (lint-staged) e `pre-push` roda o typecheck.

---

## CI/CD

Pipeline em `azure-pipelines.yml` (setup compartilhado em `.azure/templates/setup-node.yml`):

```
CI ─┬─ Quality ──── prisma validate/generate → lint → prettier → typecheck → unit + cobertura → build
    └─ Integration ─ MySQL + Redis como service containers → migrations → testes de integração
Docker ─ build da imagem runtime
Mirror ─ push para o GitHub (somente main, fora de PR)
```

Variáveis do Mirror vêm do grupo **GitHub-Sync-Vars** (`GITHUB_PAT`, `GITHUB_USER`, `GITHUB_REPO_BACKEND`).

---

## Estrutura

```text
├── .azure/templates/      # Templates reutilizáveis do pipeline
├── docker/node/           # Dockerfile multi-stage da API
├── prisma/                # schema, migrations e seeds
├── src/
│   ├── cache/             # Redis: CacheService e rate limit
│   ├── common/            # decorators, enums, filters, guards, interceptors, pipes, utils
│   ├── config/            # configs tipadas (registerAs) + validação do env
│   ├── database/          # PrismaService, repositórios (contrato → Prisma) e Unit of Work
│   ├── health/            # liveness / readiness
│   ├── integrations/      # clientes HTTP externos (telemetria, pagamentos)
│   ├── modules/           # auth, users, vehicles, stations, charging-sessions, payment, cron
│   └── main.ts
├── test/setup/            # setup global dos testes com banco
├── compose.yml
└── vitest.*.ts            # configs de unit, int e e2e
```

---

## Segurança

- **Validação estrita:** `ValidationPipe` com `whitelist` + `forbidNonWhitelisted` (bloqueia mass assignment).
- **Erros seguros:** em produção o `AllExceptionsFilter` não expõe stack trace nem erros de banco.
- **Helmet + CORS** configurados no Fastify.
- **Rate limit em 3 camadas** (short / medium / long) armazenado no Redis.
- **Readiness protegida:** `/health/ready` consulta o banco e só aceita conexões locais; `/health/live` é pública.
- **Respostas padronizadas** no formato `{ message, data }` via interceptor global.
- **Env validado** na subida e imagem Docker rodando sem root.
