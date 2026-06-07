# Banco de Dados — Guia de Operações

Stack: **PostgreSQL 16** via Docker + **Prisma 6** ORM

---

## Estrutura dos arquivos `.env`

O Prisma lê o `.env` a partir da pasta onde está o `schema.prisma`. Por isso existem dois arquivos:

| Arquivo              | Usado por                        |
|----------------------|----------------------------------|
| `.env` (raiz)        | Next.js, Fastify API, geral      |
| `packages/db/.env`   | Prisma CLI (migrations, seed, studio) |

Ambos estão no `.gitignore`. Se alterar a `DATABASE_URL`, atualize os dois.

---

## Pré-requisitos

- Docker Desktop instalado e **aberto**
- Node.js instalado (`node --version`)
- Dependências instaladas (`npm install` na raiz)

---

## 1. Subir o banco (Docker)

```bash
# Na raiz do projeto
docker compose up -d
```

O container `enge-pro-db` sobe em segundo plano na porta `5432`.

**Parar o banco (mantém os dados):**
```bash
docker compose stop
```

**Parar e remover o container (mantém os dados no volume):**
```bash
docker compose down
```

**Apagar tudo, incluindo os dados:**
```bash
docker compose down -v
```

**Ver status:**
```bash
docker ps --filter name=enge-pro-db
```

---

## 2. Rodar migrations

Migrations ficam em `packages/db/prisma/migrations/`.

**Criar e aplicar uma nova migration** (após editar o `schema.prisma`):
```bash
cd packages/db
npx prisma migrate dev --name nome-da-migration
```

Exemplo: ao adicionar um campo `telefone` no model `Obra`:
```bash
npx prisma migrate dev --name add-telefone-obra
```

**Aplicar migrations existentes** (em staging/produção, sem criar nova):
```bash
cd packages/db
npx prisma migrate deploy
```

**Ver status das migrations:**
```bash
cd packages/db
npx prisma migrate status
```

**Resetar o banco** (apaga tudo e reaplica do zero — apenas em dev):
```bash
cd packages/db
npx prisma migrate reset
```
> Atenção: isso executa o seed automaticamente após resetar.

---

## 3. Visualizar tabelas (Prisma Studio)

Interface gráfica para ver e editar dados diretamente:

```bash
cd packages/db
npx prisma studio
```

Abre em `http://localhost:5555` no navegador.

---

## 4. Seed — popular o banco com dados de dev

```bash
cd packages/db
npx prisma db seed
```

Dados criados pelo seed (`prisma/seed.ts`):

| Tipo      | Valor                              |
|-----------|------------------------------------|
| Workspace | Construtora Dev                    |
| Usuário   | `dev@construtora.dev` / `senha123` |
| Obra      | Residência Silva (EM_EXECUCAO)     |
| Orçamento | Orçamento Inicial — APROVADO       |
| Gastos    | 3 lançamentos de exemplo           |

---

## 5. Gerar o Prisma Client

Necessário após alterar o `schema.prisma` manualmente (sem criar migration):

```bash
cd packages/db
npx prisma generate
```

> O `migrate dev` já roda o generate automaticamente.

---

## 6. Fluxo típico ao alterar o schema

1. Edite `packages/db/prisma/schema.prisma`
2. Rode a migration:
   ```bash
   cd packages/db
   npx prisma migrate dev --name descricao-da-mudanca
   ```
3. O Prisma Client é regenerado automaticamente
4. Reinicie o servidor da API para recarregar o client

---

## 7. Conexão direta via psql (opcional)

```bash
docker exec -it enge-pro-db psql -U enge -d enge_pro
```

Comandos úteis dentro do psql:
```sql
\dt          -- lista todas as tabelas
\d "User"    -- descreve a tabela User
SELECT * FROM "User";
\q           -- sair
```

---

## Referência rápida

| Ação                        | Comando                                          |
|-----------------------------|--------------------------------------------------|
| Subir banco                 | `docker compose up -d`                           |
| Parar banco                 | `docker compose stop`                            |
| Nova migration              | `cd packages/db && npx prisma migrate dev --name <nome>` |
| Aplicar em produção         | `cd packages/db && npx prisma migrate deploy`    |
| Visualizar dados            | `cd packages/db && npx prisma studio`            |
| Popular com seed            | `cd packages/db && npx prisma db seed`           |
| Resetar banco (dev)         | `cd packages/db && npx prisma migrate reset`     |
| Regenerar client            | `cd packages/db && npx prisma generate`          |
| Acessar psql                | `docker exec -it enge-pro-db psql -U enge -d enge_pro` |

---

## Credenciais do banco local

| Campo    | Valor      |
|----------|------------|
| Host     | localhost  |
| Porta    | 5432       |
| Usuário  | enge       |
| Senha    | enge_dev   |
| Database | enge_pro   |
