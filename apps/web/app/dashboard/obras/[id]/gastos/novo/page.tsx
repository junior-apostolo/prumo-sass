"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gastosApi, type ItemCategoria, CATEGORIA_LABELS, CATEGORIAS } from "@/lib/gastos";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const inputClass =
  "h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15";
const labelClass = "text-[13px] font-medium text-[#334155]";

export default function NovoGastoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    categoria: "OUTROS" as ItemCategoria,
    data: todayISO(),
    fornecedor: "",
  });
  const [saving, setSaving] = useState(false);

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
      await gastosApi.create(id, {
        descricao: form.descricao.trim(),
        valor,
        categoria: form.categoria,
        data: form.data || undefined,
        fornecedor: form.fornecedor.trim() || undefined,
      });
      toast.success("Gasto registrado");
      router.push(`/dashboard/obras/${id}/gastos`);
    } catch {
      toast.error("Erro ao registrar gasto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-newsreader text-[24px] font-medium tracking-[-0.01em] text-[#0B1220]">
        Novo gasto
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descricao" className={labelClass}>Descrição *</Label>
          <Input
            id="descricao"
            placeholder="Ex: Cimento CP-II, mão de obra elétrica..."
            value={form.descricao}
            onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="valor" className={labelClass}>Valor (R$) *</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={form.valor}
            onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className={labelClass}>Categoria</Label>
          <Select
            value={form.categoria}
            onValueChange={(v) => setForm((f) => ({ ...f, categoria: v as ItemCategoria }))}
          >
            <SelectTrigger className={inputClass}>
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
          <Label htmlFor="data" className={labelClass}>Data</Label>
          <Input
            id="data"
            type="date"
            value={form.data}
            onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fornecedor" className={labelClass}>Fornecedor (opcional)</Label>
          <Input
            id="fornecedor"
            placeholder="Nome do fornecedor"
            value={form.fornecedor}
            onChange={(e) => setForm((f) => ({ ...f, fornecedor: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold px-6 h-11 shadow-[0_10px_24px_rgba(30,91,230,0.24)]"
          >
            {saving ? "Salvando..." : "Registrar gasto"}
          </Button>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/obras/${id}/gastos`)}
            className="text-[13.5px] font-medium text-[#6B7891] hover:text-[#0B1220] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
