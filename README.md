# GoodWe api

Monolítico construído com **NestJS 11** e **Fastify 5**, integrado com **SQL Server**, **Redis**

---

## 🚀 Tecnologias Core

*   **Runtime**: Node.js 24.16.x (Alpine)
*   **Gerenciador de Pacotes**: PNPM 11.6.x
*   **Framework**: NestJS 11.x com Fastify (Alta Performance)
*   **ORM**: Prisma 6.x (Suporte a SQL Server)
*   **Banco de Dados local**: Microsoft SQL Server 2022
*   **Cache**: Redis Cache

---

## 📁 Estrutura de Pastas

```text
├── .docker/                # Volumes persistentes do ambiente de desenvolvimento Docker
├── docker/                 # Configurações de containers adicionais
│   ├── node/               # Dockerfile multi-stage da aplicação NestJS
│   └── sqlserver/          # Dockerfile e entrypoints do SQL Server local
├── prisma/                 # Schema do banco de dados e arquivos de migração
├── src/
│   ├── cache/              # Módulo isolado de caching Redis (CacheService)
│   ├── common/             # Elementos globais compartilhados
│   │   ├── constants/      # Constantes do sistema
│   │   ├── decorators/     # Decoradores personalizados (@CurrentUser, @Public, etc.)
│   │   ├── dtos/           # DTOs compartilhados (Paginação, etc.)
│   │   ├── enums/          # Enums globais
│   │   ├── exceptions/     # Exceções personalizadas de regras de negócio
│   │   ├── filters/        # Filtro global de exceções (AllExceptionsFilter)
│   │   ├── guards/         # Guards de autenticação e autorização
│   │   ├── interceptors/   # Interceptadores (Logging, Timeout, etc.)
│   │   ├── interfaces/     # Tipagens e interfaces TypeScript
│   │   ├── middlewares/    # Middlewares globais (CorrelationIdMiddleware)
│   │   ├── pipes/          # Pipes de validação e transformação
│   │   ├── utils/          # Classes utilitárias (Criptografia, data)
│   │   └── types.ts        # Tipos customizados comuns
│   ├── config/             # Configurações dinâmicas tipadas e validadas (.env)
│   ├── database/           # Conexão com banco de dados (PrismaService)
│   ├── health/             # Endpoints de Terminus Health Check (/health/live, /health/ready)
│   ├── integrations/       # Clientes HTTP pré-configurados para consumo de APIs externas
│   ├── modules/            # Módulos de domínio de negócio (ex: Auth, Users, etc.)
│   ├── app.module.ts       # Módulo principal de carregamento global
│   └── main.ts             # Entrypoint da aplicação Fastify
├── compose.yml             # Orquestrador local de containers
├── package.json
└── tsconfig.json
```

---

## 🛡️ Práticas de Segurança Implementadas

1.  **Strict Validation**: Validação rigorosa em todas as rotas usando `class-validator` e `class-transformer`. Payloads com propriedades desconhecidas são sumariamente rejeitados para mitigar *Mass Assignment*.
2.  **Production-Safe Exceptions**: Em ambientes de produção, o `AllExceptionsFilter` substitui stacktraces e mensagens de erro do banco de dados por logs genéricos e seguros, evitando *Information Disclosure*.
3.  **Helmet & CORS**: Fastify Helmet ativado para configurar cabeçalhos HTTP de segurança de forma restritiva. CORS ativado por padrão.
4.  **Multi-Tier Rate Limiting**: Limite de requisições por IP ativo via Redis (`ThrottlerModule`), configurado em 3 camadas de proteção contra picos de tráfego e abusos:
    *   **Short**: Previne bursts rápidos (ex: cliques repetidos).
    *   **Medium**: Limita requisições a médio prazo.
    *   **Long**: Previne raspagem de dados e abusos contínuos.
5.  **Secured Readiness Probe**: A rota de readiness (`/health/ready`), que consulta o banco de dados, é restrita via IP a conexões locais (`127.0.0.1`/`::1`). Isso previne que usuários externos possam sobrecarregar a conexão com o banco de dados fazendo spam na rota de saúde. A rota de liveness (`/health/live`) permanece pública e estática.
6.  **Transform Interceptor**: Respostas de sucesso de todas as rotas são formatadas de forma homogênea no padrão `HttpResponse<T>` (`{ message, data }`) através de um interceptador global.

---

## ⚡ Caching & Banco de Dados

*   **Prisma Client**: O `PrismaService` implementa os hooks `OnModuleInit` e `OnModuleDestroy` para garantir o ciclo de vida saudável das conexões de banco de dados do NestJS.
*   **Redis**: O `CacheService` está configurado para operações rápidas e centralizadas de cache com expiração dinâmica.

---

## Como Iniciar Localmente

### Pré-requisitos
*   Node.js instalado (v24.16.x)
*   PNPM (v11.6.x)
*   Docker & Docker Compose

### Passo 1: Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` e crie o seu `.env`:
```bash
cp .env.example .env
```
*(Preencha as credenciais do banco conforme necessário).*

### Passo 2: Subir os Containers
Inicie todos os containers necessários (SQL Server, Redis, API):
```bash
docker compose up -d --build
```

### Passo 3: Migrar o Banco de Dados
Sincronize seu Schema do Prisma com a base de dados do SQL Server recém-criada aplicando as migrações:
```bash
pnpm run prisma:migrate:dev
```

### Passo 4: Verificar Saúde da Aplicação
Acesse no seu navegador ou via terminal:
*   **Liveness (Público)**: `http://localhost:3000/api/health/live` (Para verificar se a API está online).
*   **Readiness (Local apenas)**: Habilita apenas requisições dentro do container Docker. Pode ser verificado no Docker Compose com a checagem de saúde automática.

---

## Executando os Testes (Vitest)

A suíte de testes foi migrada para o **Vitest**, que compila os arquivos TypeScript usando SWC preservando decorators de injeção de dependência.

*   **Roda todos os testes unitários (`*.spec.ts`)**:
    ```bash
    pnpm test
    ```
*   **Roda testes unitários em modo interativo (Watch)**:
    ```bash
    pnpm test:watch
    ```
*   **Roda testes de integração (`*.int.spec.ts`)**:
    ```bash
    pnpm test:int
    ```

## 💻 Git Hooks com Husky & Lint-staged

Para manter a qualidade e consistência do código, este projeto utiliza o Git Hooks gerenciado pelo **Husky**:

*   **Pre-commit hook**: Executa o `lint-staged`, rodando automaticamente o `eslint --fix` e o `prettier --write` apenas nos arquivos `.ts` alterados.
*   **Pre-push hook**: Executa o `pnpm typecheck` (`tsc --noEmit`) para garantir que o projeto compile sem nenhum erro de tipagem antes de enviar para o repositório remoto.
