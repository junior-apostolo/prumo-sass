"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar conta");

      toast.success("Conta criada! Faça login para continuar.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
        Criar conta
      </h1>
      <p className="text-[14px] text-[#6B7891] mt-1">
        Comece a gerenciar suas obras gratuitamente
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-[13px] font-medium text-[#334155]">
            Nome completo
          </Label>
          <Input
            id="name"
            placeholder="João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>
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
          <Label htmlFor="password" className="text-[13px] font-medium text-[#334155]">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold text-[15px] shadow-[0_10px_24px_rgba(30,91,230,0.28)] mt-2"
        >
          {loading ? "Criando conta…" : "Criar conta"}
        </Button>
        <p className="text-[13.5px] text-[#6B7891] text-center">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-[#1E5BE6] hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
