import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";

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

  // ─── Health check ────────────────────────────────────────────────────────

  app.get("/health", async (_req, reply) => {
    return reply.send({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Error handler ───────────────────────────────────────────────────────

  app.setErrorHandler((error: FastifyError, _req, reply) => {
    app.log.error(error);
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
