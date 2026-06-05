import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  workspaceId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user: { id: string; workspaceId: string };
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return reply.code(401).send({ error: "Token não informado" });
  }

  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return reply.code(500).send({ error: "Configuração inválida do servidor" });
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    request.user = { id: payload.userId, workspaceId: payload.workspaceId };
  } catch {
    return reply.code(401).send({ error: "Token inválido ou expirado" });
  }
}
