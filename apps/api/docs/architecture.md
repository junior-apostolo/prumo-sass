# Arquitetura da API — SOLID na prática

Este documento explica os princípios de design que organizam o código desta API, com exemplos reais do projeto e analogias do mundo cotidiano. O objetivo é que você consiga implementar novas funcionalidades sozinho, seguindo os mesmos padrões.

---

## O que é SOLID?

SOLID é um acrônimo de cinco princípios de design de software. Cada letra representa uma regra que, quando seguida, torna o código mais fácil de entender, modificar e testar.

| Letra | Nome completo | Em uma frase |
|---|---|---|
| **S** | Single Responsibility | Um arquivo, uma razão para mudar |
| **O** | Open/Closed | Adicione coisas novas sem mexer nas existentes |
| **L** | Liskov Substitution | Troque implementações sem quebrar quem usa |
| **I** | Interface Segregation | Interfaces pequenas e focadas |
| **D** | Dependency Inversion | Dependa de contratos, não de implementações |

---

## Os 5 princípios explicados

### S — Single Responsibility (Responsabilidade Única)

> "Uma classe ou arquivo deve ter apenas uma razão para mudar."

**Analogia:** imagine um funcionário que é ao mesmo tempo recepcionista, cozinheiro, entregador e caixa. Ele até consegue fazer tudo, mas qualquer mudança em qualquer área afeta ele. Se o cardápio mudar, você tem que retreinar o mesmo cara que também atende o telefone.

**Antes** deste projeto ter SOLID, o arquivo `auth.ts` tinha 429 linhas e fazia 4 coisas: validava dados, definia schemas Swagger, acessava o banco de dados e continha as regras de negócio. Qualquer alteração — trocar bcrypt por Argon2, mudar a validação de senha, ajustar o schema do Swagger — exigia abrir o mesmo arquivo enorme.

**Depois**, cada arquivo tem uma razão para existir:
- Precisa mudar a validação de senha? → `schemas/auth.schemas.ts`
- Precisa mudar como o hash é gerado? → `services/auth.service.ts`
- Precisa mudar o formato da resposta HTTP? → `routes/auth.ts`
- Precisa trocar o banco de dados? → `repositories/user.repository.ts`

---

### O — Open/Closed (Aberto/Fechado)

> "Um módulo deve ser aberto para extensão, mas fechado para modificação."

**Analogia:** a tomada elétrica da sua parede. Você pode ligar um abajur, uma TV, um carregador — qualquer aparelho novo — sem precisar abrir a parede e refazer a fiação. A tomada está fechada para modificação, mas aberta para novos aparelhos.

**Exemplo no projeto:** o `AuthService` precisa enviar email. Hoje usamos `ConsoleEmailService` (que apenas loga no console). Quando chegarmos à integração com Resend ou SendGrid, **não tocamos em nenhum arquivo existente**. Apenas criamos uma nova classe:

```typescript
// Novo arquivo: services/resend-email.service.ts
import { Resend } from "resend";
import type { IEmailService } from "../interfaces/auth.interfaces.js";

export class ResendEmailService implements IEmailService {
  private client = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    await this.client.emails.send({
      from: "noreply@prumo.app",
      to,
      subject: "Redefina sua senha",
      html: `<a href="${resetUrl}">Clique aqui</a>`,
    });
  }
}
```

Depois, em `routes/auth.ts`, na função `buildAuthService`, troca `ConsoleEmailService` por `ResendEmailService`. O `AuthService`, os repositórios e as rotas não mudam nada.

---

### L — Liskov Substitution (Substituição de Liskov)

> "Qualquer implementação de uma interface deve poder substituir outra sem quebrar quem usa."

**Analogia:** você contratou um serviço de entregas. O contrato diz: "recebe um endereço, entrega o pacote". Não importa se é um entregador de bicicleta, moto ou drone — quem encomendou não precisa saber. Se o entregador de bicicleta quebrar o contrato e devolver o pacote em vez de entregar, aí é um problema de LSP.

**No projeto:** o `AuthService` recebe `IUserRepository`. Tanto `UserRepository` (Prisma) quanto um hipotético `InMemoryUserRepository` (para testes) implementam a mesma interface. O `AuthService` funciona igual com qualquer um dos dois — sem `if (repo instanceof UserRepository)`, sem surpresas.

---

### I — Interface Segregation (Segregação de Interfaces)

> "Não force quem usa uma interface a depender de métodos que não vai usar."

**Analogia:** ficha de cargo. Quando você contrata um entregador, a ficha pede: "sabe dirigir? conhece as rotas?". Não pede: "sabe cozinhar? sabe fazer contabilidade?". Se a ficha fosse enorme com 30 perguntas irrelevantes, seria difícil de preencher e de avaliar.

**Antes:** se houvesse uma única interface `IAuthRepository` com 15 métodos (usuários + refresh tokens + reset tokens + email), qualquer classe que precisasse apenas de um método seria forçada a implementar os outros 14 como stubs vazios.

**Depois:** quatro interfaces pequenas e focadas:

```
IUserRepository          → só fala de usuários
IRefreshTokenRepository  → só fala de tokens de sessão
IPasswordResetRepository → só fala de tokens de reset
IEmailService            → só fala de envio de email
```

Se amanhã precisar criar um serviço que apenas lê dados de usuário para um relatório, ele implementa `IUserRepository` e não precisa saber que `IRefreshTokenRepository` existe.

---

### D — Dependency Inversion (Inversão de Dependência)

> "Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações."

**Analogia:** o chef de cozinha recebe os ingredientes prontos na bancada. Ele cozinha. Não vai ao supermercado, não lava a louça, não serve a mesa. Quem monta a bancada (a cozinha) é o gerente — no nosso caso, a função `buildAuthService` em `routes/auth.ts`.

**No projeto:** o `AuthService` não importa `UserRepository`, não importa `prisma`, não sabe o que é Fastify. Ele recebe tudo pelo construtor como interfaces:

```typescript
export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,        // interface
    private readonly refreshTokenRepo: IRefreshTokenRepository, // interface
    private readonly passwordResetRepo: IPasswordResetRepository, // interface
    private readonly emailService: IEmailService,       // interface
    private readonly frontendUrl: string,
  ) {}
}
```

Isso significa que você pode testar o `AuthService` passando objetos em memória no lugar dos repositórios reais, sem precisar de banco de dados.

---

## A estrutura de camadas

```
src/
├── interfaces/      ← contratos (o QUE cada camada faz)
├── repositories/    ← acesso a dados (COMO salvar/buscar no banco)
├── services/        ← regras de negócio (QUANDO e POR QUE fazer algo)
├── schemas/         ← forma dos dados (validação e documentação)
├── routes/          ← HTTP (receber requisição, chamar serviço, responder)
├── middlewares/     ← interceptadores (autenticação, etc.)
└── lib/             ← utilitários (JWT, Prisma client, helpers de resposta)
```

### Como as camadas se comunicam

```
HTTP Request
     ↓
  routes/          → valida o body (Zod), chama o service, mapeia erros para HTTP
     ↓
  services/        → aplica as regras de negócio, orquestra repositórios e serviços externos
     ↓
  repositories/    → executa queries no banco via Prisma
     ↓
  database (Prisma)
```

A comunicação sempre flui para baixo. Um repositório nunca chama um service. Uma route nunca acessa o banco diretamente.

---

## O fluxo de uma requisição — exemplo: POST /auth/register

```
1. HTTP POST /auth/register chega no Fastify
2. routes/auth.ts
   → Zod valida o body (nome, email, senha)
   → Chama authService.register(name, email, password)
3. services/auth.service.ts
   → Verifica se o email já existe (via userRepo.findByEmail)
   → Faz o hash da senha com bcrypt
   → Cria o usuário (via userRepo.createWithWorkspace)
   → Cria o refresh token (via refreshTokenRepo.create)
   → Assina o JWT (via lib/jwt.ts)
   → Retorna { accessToken, refreshToken, user }
4. routes/auth.ts
   → Recebe o resultado
   → Devolve HTTP 201 com o payload
```

---

## Como adicionar uma nova funcionalidade

Vamos usar como exemplo a criação de um módulo de **projetos** (`Project`).

### Passo 1 — Defina os contratos (interfaces)

Crie `src/interfaces/project.interfaces.ts`:

```typescript
export type ProjectRecord = {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: Date;
};

export type CreateProjectData = {
  name: string;
  workspaceId: string;
};

export interface IProjectRepository {
  findById(id: string): Promise<ProjectRecord | null>;
  findByWorkspace(workspaceId: string): Promise<ProjectRecord[]>;
  create(data: CreateProjectData): Promise<ProjectRecord>;
  delete(id: string): Promise<void>;
}
```

### Passo 2 — Crie o repositório

Crie `src/repositories/project.repository.ts`:

```typescript
import { prisma } from "@enge-pro/db";
import type { IProjectRepository, ProjectRecord, CreateProjectData } from "../interfaces/project.interfaces.js";

export class ProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<ProjectRecord | null> {
    return prisma.project.findUnique({ where: { id } });
  }

  async findByWorkspace(workspaceId: string): Promise<ProjectRecord[]> {
    return prisma.project.findMany({ where: { workspaceId } });
  }

  async create(data: CreateProjectData): Promise<ProjectRecord> {
    return prisma.project.create({ data });
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
}
```

### Passo 3 — Crie os schemas

Crie `src/schemas/project.schemas.ts`:

```typescript
import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
});

export const projectSwaggerSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    workspaceId: { type: "string", format: "uuid" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;
```

### Passo 4 — Crie os erros de domínio e o service

Crie `src/services/project.service.ts`:

```typescript
import type { IProjectRepository, ProjectRecord } from "../interfaces/project.interfaces.js";

export class ProjectNotFoundError extends Error {
  constructor() { super("Projeto não encontrado"); }
}

export class ProjectService {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async create(name: string, workspaceId: string): Promise<ProjectRecord> {
    return this.projectRepo.create({ name, workspaceId });
  }

  async list(workspaceId: string): Promise<ProjectRecord[]> {
    return this.projectRepo.findByWorkspace(workspaceId);
  }

  async remove(id: string, workspaceId: string): Promise<void> {
    const project = await this.projectRepo.findById(id);
    if (!project) throw new ProjectNotFoundError();
    if (project.workspaceId !== workspaceId) throw new ProjectNotFoundError();
    await this.projectRepo.delete(id);
  }
}
```

### Passo 5 — Crie as rotas

Crie `src/routes/projects.ts`:

```typescript
import type { FastifyInstance } from "fastify";
import { createProjectSchema, projectSwaggerSchema } from "../schemas/project.schemas.js";
import { ProjectService, ProjectNotFoundError } from "../services/project.service.js";
import { ProjectRepository } from "../repositories/project.repository.js";
import { authenticate } from "../middlewares/authenticate.js";

export async function projectRoutes(app: FastifyInstance) {
  const projectService = new ProjectService(new ProjectRepository());

  app.post("/projects", { preHandler: authenticate, schema: { ... } }, async (req, reply) => {
    const parse = createProjectSchema.safeParse(req.body);
    if (!parse.success) return reply.code(400).send({ error: parse.error.errors[0].message });

    const project = await projectService.create(parse.data.name, req.user.workspaceId);
    return reply.code(201).send({ project });
  });

  app.get("/projects", { preHandler: authenticate, schema: { ... } }, async (req, reply) => {
    const projects = await projectService.list(req.user.workspaceId);
    return reply.send({ projects });
  });

  app.delete("/projects/:id", { preHandler: authenticate, schema: { ... } }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await projectService.remove(id, req.user.workspaceId);
      return reply.code(204).send();
    } catch (err) {
      if (err instanceof ProjectNotFoundError) return reply.code(404).send({ error: err.message });
      throw err;
    }
  });
}
```

### Passo 6 — Registre as rotas em `app.ts`

```typescript
import { projectRoutes } from "./routes/projects.js";

// dentro da função build():
await app.register(projectRoutes);
```

---

## Erros de domínio — o padrão de tratamento de erros

O projeto usa classes de erro tipadas para separar o que aconteceu (service) de como responder (route).

**Por que não retornar strings ou códigos numéricos?**

```typescript
// ❌ Frágil: a rota compara strings, quebra se alguém fizer um typo
if (error.message === "Email já cadastrado") { ... }

// ✅ Robusto: TypeScript garante que o tipo existe
if (err instanceof EmailAlreadyInUseError) { ... }
```

**O padrão:**

```typescript
// No service: lance erros de domínio
export class MeuErroDeNegocio extends Error {
  constructor() { super("Mensagem legível para o usuário"); }
}

// Na route: capture e mapeie para HTTP
try {
  await service.fazAlgo();
} catch (err) {
  if (err instanceof MeuErroDeNegocio) {
    return reply.code(400).send({ error: err.message });
  }
  throw err; // qualquer outro erro sobe para o error handler global
}
```

---

## Composição de dependências — onde "ligar os fios"

A composição é o único lugar do código onde as implementações concretas são escolhidas. Todo o resto conhece apenas interfaces.

```typescript
// routes/auth.ts
const authService = new AuthService(
  new UserRepository(),
  new RefreshTokenRepository(),
  new PasswordResetRepository(),
  new ConsoleEmailService(app.log),
  process.env.FRONTEND_URL ?? "http://localhost:3000",
);
```

Para testes, você substituiria cada `new XRepository()` por um objeto em memória que implementa a mesma interface, sem banco de dados.

### Por que `buildAuthService` existe e `userRoutes` não tem equivalente?

`buildAuthService` é apenas uma função de extração para legibilidade — **não é obrigatória**. Sem ela, o código funcionaria exatamente igual:

```typescript
export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(
    new UserRepository(),
    new RefreshTokenRepository(),
    new PasswordResetRepository(),
    new ConsoleEmailService(app.log),
    process.env.FRONTEND_URL ?? "http://localhost:3000",
  );
  // rotas...
}
```

`userRoutes` não precisa dessa extração porque instancia apenas `new UserRepository()` — uma linha, sem peso visual. Quando a "montagem" é trivial, nomear uma função para isso seria burocracia sem benefício.

A diferença entre os dois casos:

| | `userRoutes` | `authRoutes` |
|---|---|---|
| Dependências | 1 (`UserRepository`) | 5 (4 classes + URL) |
| Tem service? | Não | Sim (`AuthService`) |
| Vale extrair? | Não | Escolha de estilo |

**A regra prática:** extraia para uma função `buildXService` quando o bloco de instanciação tiver 3 ou mais dependências e começar a dificultar a leitura do início do arquivo de rotas. Com 1 ou 2, instancie diretamente. Não é um padrão do SOLID — é organização.

---

## Checklist ao criar uma nova funcionalidade

- [ ] Criei os tipos de dados e as interfaces em `interfaces/`?
- [ ] O repositório implementa a interface e **só acessa o banco**, sem lógica de negócio?
- [ ] O service recebe as dependências **pelo construtor como interfaces**, não instancia nada internamente?
- [ ] Os erros do service são **classes tipadas** que estendem `Error`?
- [ ] A rota **não acessa o banco diretamente** — apenas chama o service?
- [ ] A rota captura os erros de domínio e os mapeia para o **status HTTP correto**?
- [ ] Registrei a nova rota em `app.ts`?
