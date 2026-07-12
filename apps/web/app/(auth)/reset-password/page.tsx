"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div>
        <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Link inválido
        </h1>
        <p className="text-[14px] text-[#6B7891] mt-2">
          Este link de redefinição é inválido ou expirou.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block mt-6 text-[13.5px] font-semibold text-[#1E5BE6] hover:underline"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao redefinir senha");

      toast.success("Senha redefinida com sucesso!");
      router.push("/login");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao redefinir senha"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
        Redefinir senha
      </h1>
      <p className="text-[14px] text-[#6B7891] mt-1">Escolha uma nova senha para sua conta.</p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-[13px] font-medium text-[#334155]">
            Nova senha
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm" className="text-[13px] font-medium text-[#334155]">
            Confirmar nova senha
          </Label>
          <Input
            id="confirm"
            type="password"
            placeholder="Repita a nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {loading ? "Redefinindo…" : "Redefinir senha"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
