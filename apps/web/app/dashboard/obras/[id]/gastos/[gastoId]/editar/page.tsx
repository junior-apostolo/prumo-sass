"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gastosApi, type ItemCategoria, CATEGORIA_LABELS, CATEGORIAS } from "@/lib/gastos";

export default function EditarGastoPage() {
  const { id, gastoId } = useParams<{ id: string; gastoId: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    categoria: "OUTROS" as ItemCategoria,
    data: "",
    fornecedor: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    gastosApi
      .list(id)
      .then((gastos) => {
        const gasto = gastos.find((g) => g.id === gastoId);
        if (!gasto) {
          toast.error("Gasto não encontrado");
          router.push(`/dashboard/obras/${id}/gastos`);
          return;
        }
        setForm({
          descricao: gasto.descricao,
          valor: parseFloat(gasto.valor).toFixed(2),
          categoria: gasto.categoria,
          data: new Date(gasto.data).toISOString().slice(0, 10),
          fornecedor: gasto.fornecedor ?? "",
        });
      })
      .catch(() => {
        toast.error("Erro ao carregar gasto");
        router.push(`/dashboard/obras/${id}/gastos`);
      })
      .finally(() => setLoading(false));
  }, [id, gastoId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valor = parseFloat(form.valor);
    if (!form.descricao.trim()) {
      toast.error("Descrição obrigatória");
      return;
    }
    if (isNaN(valor) || valor <= 0) {
      toast.error("Valor inválido");
      return;
    }

    setSaving(true);
    try {
      await gastosApi.update(gastoId, {
        descricao: form.descricao.trim(),
        valor,
        categoria: form.categoria,
        data: form.data || undefined,
        fornecedor: form.fornecedor.trim() || undefined,
      });
      toast.success("Gasto atualizado");
      router.push(`/dashboard/obras/${id}/gastos`);
    } catch {
      toast.error("Erro ao atualizar gasto");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Editar gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Categoria</Label>
              <Select
                value={form.categoria}
                onValueChange={(v) => setForm((f) => ({ ...f, categoria: v as ItemCategoria }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORIA_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={form.data}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fornecedor">Fornecedor (opcional)</Label>
              <Input
                id="fornecedor"
                value={form.fornecedor}
                onChange={(e) => setForm((f) => ({ ...f, fornecedor: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/dashboard/obras/${id}/gastos`)}
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
