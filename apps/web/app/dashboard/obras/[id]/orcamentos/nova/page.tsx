"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orcamentosApi, type CreateOrcamentoInput } from "@/lib/orcamentos";
import { ApiError } from "@/lib/api";

const inputClass =
  "h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15";
const labelClass = "text-[13px] font-medium text-[#334155]";

export default function NovoOrcamentoPage() {
  const router = useRouter();
  const { id: obraId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateOrcamentoInput>({ titulo: "" });

  function handleChange(field: keyof CreateOrcamentoInput, value: string | undefined) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const newOrcamento = await orcamentosApi.create(obraId, form);
      toast.success("Orçamento criado com sucesso");
      router.push(`/dashboard/orcamentos/${newOrcamento.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao criar orçamento");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md">
      <button
        type="button"
        onClick={() => router.push(`/dashboard/obras/${obraId}`)}
        className="text-[13px] text-[#6B7891] hover:text-[#1E5BE6] transition-colors mb-4"
      >
        ← Voltar para a obra
      </button>

      <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
        Novo orçamento
      </h1>
      <p className="text-[#6B7891] text-[13.5px] mt-1">
        Preencha os dados do orçamento. Apenas o título é obrigatório.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titulo" className={labelClass}>Título *</Label>
          <Input
            id="titulo"
            type="text"
            placeholder="Ex: Orçamento Elétrica"
            value={form.titulo}
            onChange={(e) => handleChange("titulo", e.target.value)}
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="validadeAt" className={labelClass}>Válido até</Label>
          <Input
            id="validadeAt"
            type="date"
            value={form.validadeAt ?? ""}
            onChange={(e) => handleChange("validadeAt", e.target.value || undefined)}
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="observacoes" className={labelClass}>Observações</Label>
          <Textarea
            id="observacoes"
            placeholder="Observações adicionais"
            value={form.observacoes ?? ""}
            onChange={(e) => handleChange("observacoes", e.target.value || undefined)}
            disabled={loading}
            className="rounded-xl border-[#E1E8F5] px-3.5 py-2.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold shadow-[0_10px_24px_rgba(30,91,230,0.24)] h-11 px-6"
          >
            {loading ? "Criando..." : "Criar orçamento"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/obras/${obraId}`)}
            disabled={loading}
            className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF] h-11 px-6"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
