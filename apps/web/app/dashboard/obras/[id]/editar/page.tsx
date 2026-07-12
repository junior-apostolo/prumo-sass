"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obrasApi, type UpdateObraInput } from "@/lib/obras";
import { ApiError } from "@/lib/api";

export default function EditarObraPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<UpdateObraInput>({});

  useEffect(() => {
    obrasApi
      .get(id)
      .then((obra) => {
        setForm({
          nome: obra.nome,
          cliente: obra.cliente ?? undefined,
          endereco: obra.endereco ?? undefined,
          valorContrato: obra.valorContrato ? parseFloat(obra.valorContrato) : undefined,
          dataInicio: obra.dataInicio ? obra.dataInicio.slice(0, 10) : undefined,
          dataFim: obra.dataFim ? obra.dataFim.slice(0, 10) : undefined,
        });
      })
      .catch(() => {
        toast.error("Obra não encontrada");
        router.push("/dashboard/obras");
      })
      .finally(() => setFetching(false));
  }, [id, router]);

  function handleChange(field: keyof UpdateObraInput, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome?.trim()) {
      toast.error("Nome da obra é obrigatório");
      return;
    }

    setLoading(true);
    try {
      await obrasApi.update(id, form);
      toast.success("Obra atualizada");
      router.push(`/dashboard/obras/${id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao atualizar obra");
      }
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="max-w-xl mx-auto flex flex-col gap-4">
        <div className="h-8 w-48 bg-[#F1F4F9] animate-pulse rounded-lg" />
        <div className="h-64 bg-[#F1F4F9] animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-7">
        <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Editar obra
        </h1>
        <p className="text-[#6B7891] text-[13.5px] mt-1">Atualize os dados da obra.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome" className="text-[13px] font-medium text-[#334155]">
            Nome da obra *
          </Label>
          <Input
            id="nome"
            value={form.nome ?? ""}
            onChange={(e) => handleChange("nome", e.target.value)}
            disabled={loading}
            className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cliente" className="text-[13px] font-medium text-[#334155]">
            Cliente
          </Label>
          <Input
            id="cliente"
            value={form.cliente ?? ""}
            onChange={(e) => handleChange("cliente", e.target.value || undefined)}
            disabled={loading}
            className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endereco" className="text-[13px] font-medium text-[#334155]">
            Endereço
          </Label>
          <Input
            id="endereco"
            value={form.endereco ?? ""}
            onChange={(e) => handleChange("endereco", e.target.value || undefined)}
            disabled={loading}
            className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="valorContrato" className="text-[13px] font-medium text-[#334155]">
            Valor do contrato (R$)
          </Label>
          <Input
            id="valorContrato"
            type="number"
            min="0"
            step="0.01"
            value={form.valorContrato ?? ""}
            onChange={(e) =>
              handleChange("valorContrato", e.target.value ? parseFloat(e.target.value) : undefined)
            }
            disabled={loading}
            className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dataInicio" className="text-[13px] font-medium text-[#334155]">
              Data de início
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={form.dataInicio ?? ""}
              onChange={(e) => handleChange("dataInicio", e.target.value || undefined)}
              disabled={loading}
              className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dataFim" className="text-[13px] font-medium text-[#334155]">
              Previsão de término
            </Label>
            <Input
              id="dataFim"
              type="date"
              value={form.dataFim ?? ""}
              onChange={(e) => handleChange("dataFim", e.target.value || undefined)}
              disabled={loading}
              className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold px-6 h-11 shadow-[0_10px_24px_rgba(30,91,230,0.24)]"
          >
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/obras/${id}`)}
            disabled={loading}
            className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF] h-11"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
