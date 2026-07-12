"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Download, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  gastosApi,
  type GastoRecord,
  type FiltrosGasto,
  type ItemCategoria,
  CATEGORIA_LABELS,
  CATEGORIAS,
} from "@/lib/gastos";

function formatCurrency(value: string | number) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

const inputClass =
  "h-10 rounded-xl border-[#E1E8F5] focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15";

export default function GastosPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [gastos, setGastos] = useState<GastoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosGasto>({});
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosGasto>({});

  useEffect(() => {
    let cancelled = false;
    gastosApi
      .list(id, filtrosAtivos)
      .then((data) => { if (!cancelled) setGastos(data); })
      .catch(() => { if (!cancelled) toast.error("Erro ao carregar gastos"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, filtrosAtivos]);

  function handleFiltrar() {
    setLoading(true);
    setFiltrosAtivos({ ...filtros });
  }

  function handleLimparFiltros() {
    setLoading(true);
    setFiltros({});
    setFiltrosAtivos({});
  }

  async function handleDelete(gastoId: string) {
    setDeletingId(gastoId);
    try {
      await gastosApi.delete(gastoId);
      setGastos((prev) => prev.filter((g) => g.id !== gastoId));
      toast.success("Gasto excluído");
    } catch {
      toast.error("Erro ao excluir gasto");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleExportCsv() {
    try {
      const blob = await gastosApi.exportCsv(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gastos.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao exportar CSV");
    }
  }

  const total = gastos.reduce((sum, g) => sum + parseFloat(g.valor), 0);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-newsreader text-[24px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Gastos
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Exportar CSV
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/dashboard/obras/${id}/gastos/novo`)}
            className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white shadow-[0_10px_24px_rgba(30,91,230,0.24)]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo gasto
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 pb-5 border-b border-[#EEF2F9]">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#334155]">Categoria</label>
          <Select
            value={filtros.categoria ?? "TODOS"}
            onValueChange={(v) =>
              setFiltros((f) => ({ ...f, categoria: v === "TODOS" ? undefined : (v as ItemCategoria) }))
            }
          >
            <SelectTrigger className={`w-44 ${inputClass}`}>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todas</SelectItem>
              {CATEGORIAS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORIA_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#334155]">Data início</label>
          <Input
            type="date"
            className={`w-40 ${inputClass}`}
            value={filtros.dataInicio ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, dataInicio: e.target.value || undefined }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[#334155]">Data fim</label>
          <Input
            type="date"
            className={`w-40 ${inputClass}`}
            value={filtros.dataFim ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, dataFim: e.target.value || undefined }))}
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleFiltrar}
            className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white"
          >
            Filtrar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLimparFiltros}
            className="rounded-full text-[#6B7891] hover:bg-[#F7FAFF] hover:text-[#0B1220]"
          >
            Limpar
          </Button>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-[#F1F4F9] animate-pulse rounded-xl" />
          ))}
        </div>
      ) : gastos.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-[14px] text-[#6B7891]">Nenhum gasto registrado ainda.</p>
          <button
            type="button"
            onClick={() => router.push(`/dashboard/obras/${id}/gastos/novo`)}
            className="mt-2 text-[13.5px] font-semibold text-[#1E5BE6] hover:underline"
          >
            Registrar o primeiro gasto
          </button>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EEF2F9]">
              <th className="text-left px-2 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-[#9AA7BD]">Data</th>
              <th className="text-left px-2 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-[#9AA7BD]">Descrição</th>
              <th className="text-left px-2 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-[#9AA7BD]">Categoria</th>
              <th className="text-left px-2 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-[#9AA7BD]">Fornecedor</th>
              <th className="text-right px-2 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-[#9AA7BD]">Valor</th>
              <th className="px-2 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2F9]">
            {gastos.map((g) => (
              <tr key={g.id} className="hover:bg-[#F7FAFF] transition-colors">
                <td className="px-2 py-3 text-[#6B7891] whitespace-nowrap">
                  {formatDate(g.data)}
                </td>
                <td className="px-2 py-3 font-medium text-[#0B1220]">{g.descricao}</td>
                <td className="px-2 py-3 text-[#6B7891]">{CATEGORIA_LABELS[g.categoria]}</td>
                <td className="px-2 py-3 text-[#6B7891]">{g.fornecedor ?? "—"}</td>
                <td className="px-2 py-3 text-right font-medium text-[#0B1220] tabular-nums">{formatCurrency(g.valor)}</td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/obras/${id}/gastos/${g.id}/editar`)
                      }
                      className="rounded-full text-[#6B7891] hover:text-[#1E5BE6] hover:bg-[#EEF3FF]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === g.id}
                            className="rounded-full text-[#9AA7BD] hover:text-[#C8434F] hover:bg-[#FBE9EA]"
                          />
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-newsreader text-[20px] font-medium text-[#0B1220]">
                            Excluir gasto?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-[#6B7891]">
                            &quot;{g.descricao}&quot; — {formatCurrency(g.valor)} será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-full border-[#E1E8F5] text-[#334155]">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(g.id)}
                            className="rounded-full bg-[#C8434F] hover:bg-[#b23a44] text-white"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[#EEF3FF]">
              <td colSpan={4} className="px-2 py-3 rounded-l-xl font-semibold text-[#0B1220]">
                Total
              </td>
              <td className="px-2 py-3 text-right font-newsreader font-semibold text-[#1E5BE6] tabular-nums">
                {formatCurrency(total)}
              </td>
              <td className="rounded-r-xl" />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
