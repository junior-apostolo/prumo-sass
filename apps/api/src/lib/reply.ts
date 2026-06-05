import type { FastifyReply } from "fastify";

export const ok = (reply: FastifyReply, data: unknown) =>
  reply.code(200).send({ data });

export const created = (reply: FastifyReply, data: unknown) =>
  reply.code(201).send({ data });

export const noContent = (reply: FastifyReply) => reply.code(204).send();

export const badRequest = (reply: FastifyReply, message: string, details?: unknown) =>
  reply.code(400).send({ error: message, details });

export const unauthorized = (reply: FastifyReply, message = "Não autorizado") =>
  reply.code(401).send({ error: message });

export const forbidden = (reply: FastifyReply) =>
  reply.code(403).send({ error: "Acesso negado" });

export const notFound = (reply: FastifyReply, message = "Recurso não encontrado") =>
  reply.code(404).send({ error: message });

export const serverError = (reply: FastifyReply, err: unknown) => {
  console.error(err);
  return reply.code(500).send({ error: "Erro interno do servidor" });
};
