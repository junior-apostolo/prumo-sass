"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrcamentoStatusBadge } from "@/components/orcamentos/orcamento-status-badge";
import {
  orcamentosApi,
  type OrcamentoComItens,
  type OrcamentoStatus,
  type ItemCategoria,
} from "@/lib/orcamentos";

type ItemLocal = {
  id?: string;
  descricao: string;
  categoria: ItemCategoria;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  ordem: number;
};

const STATUS_OPTIONS = [
  { value: "RASCUNHO" as OrcamentoStatus, label: "Rascunho" },
  { value: "ENVIADO" as OrcamentoStatus, label: "Enviado" },
  { value: "APROVADO" as OrcamentoStatus, label: "Aprovado" },
  { value: "RECUSADO" as OrcamentoStatus, label: "Recusado" },
] as const;

const CATEGORIA_LABELS: Record<ItemCategoria, string> = {
  MATERIAL: "Material",
  MAO_DE_OBRA: "Mão de obra",
  EQUIPAMENTO: "Equipamento",
  SERVICO: "Serviço",
  OUTROS: "Outros",
};

const CATEGORIAS = Object.keys(CATEGORIA_LABELS) as ItemCategoria[];

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function OrcamentoEditorPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [orcamento, setOrcamento] = useState<OrcamentoComItens | null>(null);
  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [validadeAt, setValidadeAt] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [savingHeader, setSavingHeader] = useState(false);

  const [itens, setItens] = useState<ItemLocal[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    orcamentosApi
      .get(id)
      .then((data) => {
        setOrcamento(data);
        setTitulo(data.titulo);
        setValidadeAt(data.validadeAt ? data.validadeAt.slice(0, 10) : "");
        setObservacoes(data.observacoes ?? "");
        setItens(
          data.itens.map((it) => ({
            ...it,
            quantidade: parseFloat(it.quantidade),
            valorUnitario: parseFloat(it.valorUnitario),
          }))
        );
        hasLoaded.current = true;
      })
      .catch(() => {
        toast.error("Orçamento não encontrado");
        router.push("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleSaveHeader() {
    if (!orcamento) return;
    setSavingHeader(true);
    try {
      const updated = await orcamentosApi.update(id, {
        titulo,
        validadeAt: validadeAt || undefined,
        observacoes: observacoes || undefined,
      });
      setOrcamento((prev) => prev ? { ...prev, ...updated } : prev);
      toast.success("Cabeçalho salvo");
    } catch {
      toast.error("Erro ao salvar cabeçalho");
    } finally {
      setSavingHeader(false);
    }
  }

  async function handleStatusChange(status: OrcamentoStatus) {
    if (!orcamento) return;
    try {
      const updated = await orcamentosApi.updateStatus(id, status);
      setOrcamento((prev) => prev ? { ...prev, ...updated } : prev);
      toast.success("Status atualizado");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  function updateItem(index: number, field: keyof ItemLocal, value: string | number) {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItens((prev) => [
      ...prev,
      {
        descricao: "",
        categoria: "SERVICO",
        unidade: "un",
        quantidade: 1,
        valorUnitario: 0,
        ordem: prev.length,
      },
    ]);
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  const saveItens = useCallback(async (itensParaSalvar: ItemLocal[]) => {
    setSaveStatus("saving");
    try {
      const input = itensParaSalvar.map((item, i) => ({
        id: item.id,
        descricao: item.descricao,
        categoria: item.categoria,
        unidade: item.unidade,
        quantidade: item.quantidade,
        valorUnitario: item.valorUnitario,
        ordem: i,
      }));
      const updated = await orcamentosApi.upsertItens(id, input);
      setOrcamento((prev) => prev ? { ...prev, ...updated } : prev);
      setItens(
        updated.itens.map((it) => ({
          ...it,
          quantidade: parseFloat(it.quantidade),
          valorUnitario: parseFloat(it.valorUnitario),
        }))
      );
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
      toast.error("Erro ao salvar itens");
    }
  }, [id]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSaveStatus("idle");
    debounceRef.current = setTimeout(() => {
      saveItens(itens);
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [itens, saveItens]);

  const subtotais = itens.reduce<Record<ItemCategoria, number>>(
    (acc, item) => {
      acc[item.categoria] = (acc[item.categoria] ?? 0) + item.quantidade * item.valorUnitario;
      return acc;
    },
    {} as Record<ItemCategoria, number>
  );

  const totalGeral = Object.values(subtotais).reduce((sum, v) => sum + v, 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl">
        <div className="h-8 w-72 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!orcamento) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{orcamento.titulo}</h1>
          <OrcamentoStatusBadge status={orcamento.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <FileDown className="w-4 h-4 mr-1.5" />
            Gerar PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cabeçalho do orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={savingHeader}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="validadeAt">Válido até</Label>
                <Input
                  id="validadeAt"
                  type="date"
                  value={validadeAt}
                  onChange={(e) => setValidadeAt(e.target.value)}
                  disabled={savingHeader}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                disabled={savingHeader}
                placeholder="Observações adicionais"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleSaveHeader} disabled={savingHeader}>
                {savingHeader ? "Salvando..." : "Salvar cabeçalho"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                  Alterar status
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {STATUS_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      className={orcamento.status === opt.value ? "font-medium" : ""}
                    >
                      {opt.label}
                      {orcamento.status === opt.value && " ✓"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Itens do orçamento</CardTitle>
            <Button size="sm" variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1.5" />
              Adicionar item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left pb-2 font-medium w-[30%]">Descrição</th>
                  <th className="text-left pb-2 font-medium w-[15%]">Categoria</th>
                  <th className="text-left pb-2 font-medium w-[8%]">Unidade</th>
                  <th className="text-left pb-2 font-medium w-[10%]">Qtd</th>
                  <th className="text-left pb-2 font-medium w-[12%]">Valor Unit.</th>
                  <th className="text-right pb-2 font-medium w-[12%]">Total</th>
                  <th className="w-[6%]" />
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      Nenhum item. Clique em "Adicionar item" para começar.
                    </td>
                  </tr>
                )}
                {itens.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-2">
                      <Input
                        value={item.descricao}
                        onChange={(e) => updateItem(i, "descricao", e.target.value)}
                        placeholder="Descrição do serviço"
                        className="h-8"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <select
                        value={item.categoria}
                        onChange={(e) => updateItem(i, "categoria", e.target.value as ItemCategoria)}
                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {CATEGORIAS.map((cat) => (
                          <option key={cat} value={cat}>
                            {CATEGORIA_LABELS[cat]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5 pr-2">
                      <Input
                        value={item.unidade}
                        onChange={(e) => updateItem(i, "unidade", e.target.value)}
                        placeholder="un"
                        className="h-8"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantidade}
                        onChange={(e) => updateItem(i, "quantidade", parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.valorUnitario}
                        onChange={(e) => updateItem(i, "valorUnitario", parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums">
                      {formatCurrency(item.quantidade * item.valorUnitario)}
                    </td>
                    <td className="py-1.5 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(i)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={() => saveItens(itens)} disabled={saveStatus === "saving"}>
                {saveStatus === "saving" ? "Salvando..." : "Salvar itens"}
              </Button>
              {saveStatus === "saving" && (
                <span className="text-sm text-muted-foreground">Salvando…</span>
              )}
              {saveStatus === "saved" && (
                <span className="text-sm text-green-600">Salvo ✓</span>
              )}
              {saveStatus === "error" && (
                <span className="text-sm text-red-600">Erro ao salvar</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Totais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5 max-w-xs">
            {CATEGORIAS.filter((cat) => subtotais[cat] > 0).map((cat) => (
              <div key={cat} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{CATEGORIA_LABELS[cat]}:</span>
                <span className="tabular-nums">{formatCurrency(subtotais[cat])}</span>
              </div>
            ))}
            <div className="border-t mt-1 pt-1.5 flex justify-between font-semibold">
              <span>Total geral:</span>
              <span className="tabular-nums">{formatCurrency(totalGeral)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
