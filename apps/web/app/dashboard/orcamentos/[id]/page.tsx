"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, FileDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { downloadBlob } from "@/lib/demo-api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ItemLocal = {
  localId: string;
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

type SortableRowProps = {
  item: ItemLocal;
  index: number;
  onUpdate: (index: number, field: keyof ItemLocal, value: string | number) => void;
  onRemove: (index: number) => void;
};

function SortableRow({ item, index, onUpdate, onRemove }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.localId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-[#EEF2F9] last:border-0 hover:bg-[#F7FAFF]">
      <td className="py-1.5 pr-2 w-6">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#9AA7BD] hover:text-[#334155] p-1"
          tabIndex={-1}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="py-1.5 pr-2">
        <Input
          value={item.descricao}
          onChange={(e) => onUpdate(index, "descricao", e.target.value)}
          placeholder="Descrição do serviço"
          className="h-8 rounded-lg border-[#E1E8F5] focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </td>
      <td className="py-1.5 pr-2">
        <select
          value={item.categoria}
          onChange={(e) => onUpdate(index, "categoria", e.target.value as ItemCategoria)}
          className="h-8 w-full rounded-lg border border-[#E1E8F5] bg-white px-2 text-sm text-[#334155] focus:outline-none focus:ring-3 focus:ring-[#1E5BE6]/15 focus:border-[#1E5BE6]"
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
          onChange={(e) => onUpdate(index, "unidade", e.target.value)}
          placeholder="un"
          className="h-8 rounded-lg border-[#E1E8F5] focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </td>
      <td className="py-1.5 pr-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.quantidade}
          onChange={(e) => onUpdate(index, "quantidade", parseFloat(e.target.value) || 0)}
          className="h-8 rounded-lg border-[#E1E8F5] focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </td>
      <td className="py-1.5 pr-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={item.valorUnitario}
          onChange={(e) => onUpdate(index, "valorUnitario", parseFloat(e.target.value) || 0)}
          className="h-8 rounded-lg border-[#E1E8F5] focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </td>
      <td className="py-1.5 pr-2 text-right tabular-nums text-[#0B1220] font-medium">
        {formatCurrency(item.quantidade * item.valorUnitario)}
      </td>
      <td className="py-1.5 text-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[#9AA7BD] hover:text-[#C8434F] hover:bg-[#FBE9EA]"
          onClick={() => onRemove(index)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}

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
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoaded = useRef(false);
  const isSyncing = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
            localId: it.id ?? crypto.randomUUID(),
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
        localId: crypto.randomUUID(),
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

  async function handleDownloadPdf() {
    setGeneratingPdf(true);
    try {
      const blob = await orcamentosApi.downloadPdf(id);
      downloadBlob(blob, `orcamento-${orcamento?.titulo ?? id}.pdf`);
    } catch {
      toast.error("Erro ao gerar PDF");
    } finally {
      setGeneratingPdf(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItens((prev) => {
        const oldIndex = prev.findIndex((item) => item.localId === active.id);
        const newIndex = prev.findIndex((item) => item.localId === over.id);
        return arrayMove(prev, oldIndex, newIndex).map((item, i) => ({ ...item, ordem: i }));
      });
    }
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
      isSyncing.current = true;
      setItens(
        updated.itens.map((it) => ({
          localId: it.id,
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
    if (isSyncing.current) {
      isSyncing.current = false;
      return;
    }
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
        <div className="h-8 w-72 bg-[#F1F4F9] animate-pulse rounded-lg" />
        <div className="h-48 bg-[#F1F4F9] animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!orcamento) return null;

  return (
    <div className="flex flex-col max-w-5xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
            {orcamento.titulo}
          </h1>
          <OrcamentoStatusBadge status={orcamento.status} />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPdf}
          disabled={generatingPdf}
          className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
        >
          <FileDown className="w-4 h-4 mr-1.5" />
          {generatingPdf ? "Gerando PDF…" : "Gerar PDF"}
        </Button>
      </div>

      {/* Cabeçalho */}
      <section className="mt-8 pt-8 border-t border-[#EEF2F9]">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#9AA7BD] mb-4">
          Cabeçalho do orçamento
        </p>
        <div className="flex flex-col gap-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="titulo" className="text-[13px] font-medium text-[#334155]">Título</Label>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={savingHeader}
                className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="validadeAt" className="text-[13px] font-medium text-[#334155]">Válido até</Label>
              <Input
                id="validadeAt"
                type="date"
                value={validadeAt}
                onChange={(e) => setValidadeAt(e.target.value)}
                disabled={savingHeader}
                className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="observacoes" className="text-[13px] font-medium text-[#334155]">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={savingHeader}
              placeholder="Observações adicionais"
              className="rounded-xl border-[#E1E8F5] px-3.5 py-2.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={handleSaveHeader}
              disabled={savingHeader}
              className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold"
            >
              {savingHeader ? "Salvando..." : "Salvar cabeçalho"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]" />}>
                Alterar status
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {STATUS_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={orcamento.status === opt.value ? "font-medium text-[#1E5BE6]" : ""}
                  >
                    {opt.label}
                    {orcamento.status === opt.value && " ✓"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Itens */}
      <section className="mt-8 pt-8 border-t border-[#EEF2F9]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#9AA7BD]">
            Itens do orçamento
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={addItem}
            className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Adicionar item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EEF2F9] text-[11.5px] uppercase tracking-[0.04em] text-[#9AA7BD]">
                  <th className="w-6 pb-2" />
                  <th className="text-left pb-2 font-semibold w-[28%]">Descrição</th>
                  <th className="text-left pb-2 font-semibold w-[15%]">Categoria</th>
                  <th className="text-left pb-2 font-semibold w-[8%]">Unidade</th>
                  <th className="text-left pb-2 font-semibold w-[10%]">Qtd</th>
                  <th className="text-left pb-2 font-semibold w-[12%]">Valor Unit.</th>
                  <th className="text-right pb-2 font-semibold w-[12%]">Total</th>
                  <th className="w-[6%]" />
                </tr>
              </thead>
              <tbody>
                <SortableContext items={itens.map((i) => i.localId)} strategy={verticalListSortingStrategy}>
                  {itens.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-[#9AA7BD]">
                        Nenhum item. Clique em "Adicionar item" para começar.
                      </td>
                    </tr>
                  )}
                  {itens.map((item, i) => (
                    <SortableRow
                      key={item.localId}
                      item={item}
                      index={i}
                      onUpdate={updateItem}
                      onRemove={removeItem}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EEF2F9]">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => saveItens(itens)}
              disabled={saveStatus === "saving"}
              className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold"
            >
              {saveStatus === "saving" ? "Salvando..." : "Salvar itens"}
            </Button>
            {saveStatus === "saving" && (
              <span className="text-sm text-[#9AA7BD]">Salvando…</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-sm text-[#1F9D63] font-medium">Salvo ✓</span>
            )}
            {saveStatus === "error" && (
              <span className="text-sm text-[#C8434F] font-medium">Erro ao salvar</span>
            )}
          </div>
        </div>
      </section>

      {/* Totais */}
      <section className="mt-8 pt-8 border-t border-[#EEF2F9]">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#9AA7BD] mb-4">
          Totais
        </p>
        <div className="flex flex-col gap-1.5 max-w-xs">
          {CATEGORIAS.filter((cat) => subtotais[cat] > 0).map((cat) => (
            <div key={cat} className="flex justify-between text-sm text-[#334155]">
              <span className="text-[#6B7891]">{CATEGORIA_LABELS[cat]}:</span>
              <span className="tabular-nums">{formatCurrency(subtotais[cat])}</span>
            </div>
          ))}
          <div className="border-t border-[#EEF2F9] mt-1 pt-2 flex justify-between items-baseline">
            <span className="font-medium text-[#0B1220]">Total geral:</span>
            <span className="font-newsreader font-semibold text-[19px] text-[#1E5BE6] tabular-nums">
              {formatCurrency(totalGeral)}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
