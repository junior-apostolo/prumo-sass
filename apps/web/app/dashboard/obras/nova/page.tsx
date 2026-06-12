"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obrasApi, type CreateObraInput } from "@/lib/obras";
import { ApiError } from "@/lib/api";

export default function NovaObraPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateObraInput>({ nome: "" });

  function handleChange(field: keyof CreateObraInput, value: string | number | undefined) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("Nome da obra é obrigatório");
      return;
    }

    setLoading(true);
    try {
      await obrasApi.create(form);
      toast.success("Obra criada com sucesso");
      router.push("/dashboard/obras");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Erro ao criar obra");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Nova obra</h1>
        <p className="text-muted-foreground text-sm mt-1">Preencha os dados da obra. Apenas o nome é obrigatório.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da obra</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome da obra *</Label>
              <Input
                id="nome"
                placeholder="Ex: Reforma Apto 302"
                value={form.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                placeholder="Nome do cliente"
                value={form.cliente ?? ""}
                onChange={(e) => handleChange("cliente", e.target.value || undefined)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                placeholder="Endereço da obra"
                value={form.endereco ?? ""}
                onChange={(e) => handleChange("endereco", e.target.value || undefined)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valorContrato">Valor do contrato (R$)</Label>
              <Input
                id="valorContrato"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.valorContrato ?? ""}
                onChange={(e) =>
                  handleChange("valorContrato", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dataInicio">Data de início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={form.dataInicio ?? ""}
                  onChange={(e) => handleChange("dataInicio", e.target.value || undefined)}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dataFim">Previsão de término</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={form.dataFim ?? ""}
                  onChange={(e) => handleChange("dataFim", e.target.value || undefined)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar obra"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/obras")}
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
