"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orcamentosApi, type CreateOrcamentoInput } from "@/lib/orcamentos";
import { ApiError } from "@/lib/api";

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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Novo orçamento</h1>
        <p className="text-muted-foreground text-sm mt-1">Preencha os dados do orçamento. Apenas o título é obrigatório.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                type="text"
                placeholder="Ex: Orçamento Elétrica"
                value={form.titulo}
                onChange={(e) => handleChange("titulo", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="validadeAt">Válido até</Label>
              <Input
                id="validadeAt"
                type="date"
                value={form.validadeAt ?? ""}
                onChange={(e) => handleChange("validadeAt", e.target.value || undefined)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais"
                value={form.observacoes ?? ""}
                onChange={(e) => handleChange("observacoes", e.target.value || undefined)}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar orçamento"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/obras/${obraId}`)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
