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
        <h2 className="text-xl font-semibold">Gastos</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Exportar CSV
          </Button>
          <Button size="sm" onClick={() => router.push(`/dashboard/obras/${id}/gastos/novo`)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Novo gasto
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border bg-muted/30">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Categoria</label>
          <Select
            value={filtros.categoria ?? "TODOS"}
            onValueChange={(v) =>
              setFiltros((f) => ({ ...f, categoria: v === "TODOS" ? undefined : (v as ItemCategoria) }))
            }
          >
            <SelectTrigger className="w-44">
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
          <label className="text-xs font-medium text-muted-foreground">Data início</label>
          <Input
            type="date"
            className="w-40"
            value={filtros.dataInicio ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, dataInicio: e.target.value || undefined }))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Data fim</label>
          <Input
            type="date"
            className="w-40"
            value={filtros.dataFim ?? ""}
            onChange={(e) => setFiltros((f) => ({ ...f, dataFim: e.target.value || undefined }))}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={handleFiltrar}>
            Filtrar
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLimparFiltros}>
            Limpar
          </Button>
        </div>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : gastos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum gasto registrado ainda.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Descrição</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Categoria</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fornecedor</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {gastos.map((g) => (
                <tr key={g.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(g.data)}
                  </td>
                  <td className="px-4 py-3 font-medium">{g.descricao}</td>
                  <td className="px-4 py-3 text-muted-foreground">{CATEGORIA_LABELS[g.categoria]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{g.fornecedor ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(g.valor)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/obras/${id}/gastos/${g.id}/editar`)
                        }
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
                            />
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir gasto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &quot;{g.descricao}&quot; — {formatCurrency(g.valor)} será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(g.id)}>
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
            <tfoot className="border-t bg-muted/30">
              <tr>
                <td colSpan={4} className="px-4 py-3 font-medium">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatCurrency(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
