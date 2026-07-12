"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
        Entrar
      </h1>
      <p className="text-[14px] text-[#6B7891] mt-1">Acesse sua conta PRUMO</p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-[13px] font-medium text-[#334155]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-medium text-[#334155]">
              Senha
            </Label>
            <Link
              href="/forgot-password"
              className="text-[12.5px] text-[#1E5BE6] font-medium hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold text-[15px] shadow-[0_10px_24px_rgba(30,91,230,0.28)] mt-2"
        >
          {loading ? "Entrando…" : "Entrar"}
        </Button>
        <p className="text-[13.5px] text-[#6B7891] text-center">
          Não tem conta?{" "}
          <Link href="/register" className="font-semibold text-[#1E5BE6] hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
