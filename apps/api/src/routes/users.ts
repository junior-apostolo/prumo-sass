import type { FastifyInstance } from "fastify";
import { prisma } from "@enge-pro/db";
import { authenticate } from "../middlewares/authenticate.js";

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/users/me",
    {
      preHandler: authenticate,
      schema: {
        tags: ["Users"],
        summary: "Dados do usuário autenticado",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Perfil do usuário",
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  workspaceId: { type: "string", format: "uuid" },
                  role: { type: "string", enum: ["OWNER", "MEMBER"] },
                },
              },
            },
          },
          401: {
            description: "Não autorizado",
            type: "object",
            properties: { error: { type: "string" } },
          },
          404: {
            description: "Usuário não encontrado",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    async (req, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, name: true, email: true, workspaceId: true, role: true },
      });

      if (!user) return reply.code(404).send({ error: "Usuário não encontrado" });

      return reply.send({ user });
    }
  );
}
