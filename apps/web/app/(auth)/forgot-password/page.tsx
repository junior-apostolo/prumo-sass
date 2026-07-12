"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Email enviado
        </h1>
        <p className="text-[14px] text-[#6B7891] mt-2 leading-relaxed">
          Se o email <strong className="text-[#0B1220] font-medium">{email}</strong> estiver
          cadastrado, você receberá as instruções em breve.
        </p>
        <Link
          href="/login"
          className="inline-block mt-6 text-[13.5px] font-semibold text-[#1E5BE6] hover:underline"
        >
          ← Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
        Esqueci minha senha
      </h1>
      <p className="text-[14px] text-[#6B7891] mt-1">
        Informe seu email e enviaremos as instruções de recuperação.
      </p>

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

        <Button
          type="submit"
          disabled={loading}
          className="h-11 rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold text-[15px] shadow-[0_10px_24px_rgba(30,91,230,0.28)] mt-2"
        >
          {loading ? "Enviando…" : "Enviar instruções"}
        </Button>
        <Link
          href="/login"
          className="text-[13.5px] text-[#6B7891] hover:text-[#1E5BE6] text-center transition-colors"
        >
          ← Voltar para o login
        </Link>
      </form>
    </div>
  );
}
