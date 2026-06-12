import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({ refreshToken: z.string().uuid() });
export const logoutSchema = z.object({ refreshToken: z.string().uuid() });
export const forgotPasswordSchema = z.object({ email: z.string().email() });
export const resetPasswordSchema = z.object({
  token: z.string().uuid(),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export const userSwaggerSchema = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
    workspaceId: { type: "string", format: "uuid" },
  },
} as const;

export const errorSwaggerSchema = {
  type: "object",
  properties: { error: { type: "string" } },
} as const;

export const authResponseSwaggerSchema = {
  type: "object",
  properties: {
    accessToken: { type: "string", description: "JWT válido por 7 dias" },
    refreshToken: { type: "string", format: "uuid", description: "Token de renovação válido por 30 dias" },
    user: userSwaggerSchema,
  },
} as const;
