import "dotenv/config";
import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/users.js";
import { obrasRoutes } from "./routes/obras.js";
import { demoRoutes } from "./routes/demo.js";

async function build() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
      transport:
        process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  // ─── Plugins ──────────────────────────────────────────────────────────────

  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "PRUMO API",
        description:
          "API para gerenciamento de obras — cadastro, orçamentos e controle financeiro",
        version: "0.1.0",
      },
      servers: [{ url: "http://localhost:3001", description: "Desenvolvimento" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Access token retornado pelo login ou refresh",
          },
        },
      },
      tags: [
        { name: "Auth", description: "Autenticação e gerenciamento de sessões" },
        { name: "Users", description: "Dados do usuário autenticado" },
        { name: "Obras", description: "Gerenciamento de obras" },
        { name: "Demo", description: "Geração de orçamento público sem autenticação" },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: true, persistAuthorization: true },
    staticCSP: true,
  });

  await app.register(helmet, { contentSecurityPolicy: false });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await app.register(multipart, {
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  });

  // ─── Routes ──────────────────────────────────────────────────────────────

  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(obrasRoutes);
  await app.register(demoRoutes);

  // ─── Health check ────────────────────────────────────────────────────────

  app.get("/health", async (_req, reply) => {
    return reply.send({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Error handler ───────────────────────────────────────────────────────

  app.setErrorHandler((error: FastifyError, _req, reply) => {
    app.log.error(error);
    if (error.validation) {
      return reply.code(400).send({ error: error.message });
    }
    if (error.statusCode) {
      return reply.code(error.statusCode).send({ error: error.message });
    }
    return reply.code(500).send({ error: "Erro interno do servidor" });
  });

  return app;
}

async function start() {
  const app = await build();
  const PORT = Number(process.env.PORT ?? 3001);

  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
