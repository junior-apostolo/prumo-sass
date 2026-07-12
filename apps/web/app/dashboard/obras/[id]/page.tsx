"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Archive, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ObraStatusBadge } from "@/components/obras/obra-status-badge";
import { OrcamentoStatusBadge } from "@/components/orcamentos/orcamento-status-badge";
import { obrasApi, type ObraComResumo, type ObraStatus } from "@/lib/obras";
import { orcamentosApi, type OrcamentoDTO } from "@/lib/orcamentos";
import { gastosApi, type GastoRecord, CATEGORIA_LABELS } from "@/lib/gastos";

const STATUS_OPTIONS: { value: ObraStatus; label: string }[] = [
  { value: "PLANEJAMENTO", label: "Planejamento" },
  { value: "EM_EXECUCAO", label: "Em execução" },
  { value: "PAUSADA", label: "Pausada" },
  { value: "CONCLUIDA", label: "Concluída" },
];

function formatCurrency(value: number | string | null) {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercent(value: number | null) {
  if (value === null) return null;
  return `${value.toFixed(1)}%`;
}

const UPGRADE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_UPGRADE_WHATSAPP_NUMBER;

export default function ObraDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [obra, setObra] = useState<ObraComResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [orcamentos, setOrcamentos] = useState<OrcamentoDTO[]>([]);
  const [loadingOrcamentos, setLoadingOrcamentos] = useState(true);
  const [gastosRecentes, setGastosRecentes] = useState<GastoRecord[]>([]);
  const [loadingGastos, setLoadingGastos] = useState(true);

  useEffect(() => {
    obrasApi
      .get(id)
      .then(setObra)
      .catch(() => {
        toast.error("Obra não encontrada");
        router.push("/dashboard/obras");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    orcamentosApi
      .list(id)
      .then(setOrcamentos)
      .catch(() => {})
      .finally(() => setLoadingOrcamentos(false));
  }, [id]);

  useEffect(() => {
    gastosApi
      .list(id)
      .then((gs) => setGastosRecentes(gs.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingGastos(false));
  }, [id]);

  async function handleStatusChange(status: ObraStatus) {
    if (!obra) return;
    try {
      const updated = await obrasApi.updateStatus(obra.id, status);
      setObra((prev) => prev ? { ...prev, ...updated } : prev);
      toast.success("Status atualizado");
    } catch {
      toast.error("Erro ao atualizar status");
    }
  }

  async function handleArchive() {
    if (!obra) return;
    setArchiving(true);
    try {
      await obrasApi.archive(obra.id);
      toast.success("Obra arquivada");
      router.push("/dashboard/obras");
    } catch {
      toast.error("Erro ao arquivar obra");
      setArchiving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-4xl">
        <div className="h-8 w-64 bg-[#F1F4F9] animate-pulse rounded-lg" />
        <div className="h-28 bg-[#F1F4F9] animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!obra) return null;

  const percentual = formatPercent(obra.percentualConsumido);
  const alerta = obra.percentualConsumido !== null && obra.percentualConsumido > 80;

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
              {obra.nome}
            </h1>
            <ObraStatusBadge status={obra.status} />
            {alerta && (
              <Badge className="bg-[#FBE9EA] text-[#C8434F] hover:bg-[#FBE9EA] rounded-full border-transparent">
                Atenção: {percentual} consumido
              </Badge>
            )}
            {alerta && UPGRADE_WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${UPGRADE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  "Quero saber mais sobre o PRUMO Pro e alertas de orçamento.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] font-semibold text-[#1E5BE6] hover:underline"
              >
                Quer mais controle? Fale sobre o Pro
              </a>
            )}
          </div>
          {obra.cliente && <p className="text-[#334155]">{obra.cliente}</p>}
          {obra.endereco && <p className="text-sm text-[#6B7891]">{obra.endereco}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
                />
              }
            >
              Alterar status
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={obra.status === opt.value ? "font-medium" : ""}
                >
                  {opt.label}
                  {obra.status === opt.value && " ✓"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/obras/${obra.id}/editar`)}
            className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  disabled={archiving}
                  className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
                />
              }
            >
              <Archive className="w-4 h-4 mr-1.5" />
              Arquivar
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Arquivar obra?</AlertDialogTitle>
                <AlertDialogDescription>
                  A obra &quot;{obra.nome}&quot; será arquivada e não aparecerá mais na lista principal. Os dados
                  serão mantidos e você poderá consultá-los futuramente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchive} disabled={archiving}>
                  {archiving ? "Arquivando..." : "Arquivar obra"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Resumo financeiro */}
      <div className="rounded-2xl border border-[#EEF2F9] shadow-[0_10px_30px_rgba(20,50,120,0.06)] grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#EEF2F9]">
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">Contratado</p>
          <p className="font-newsreader text-[21px] font-semibold text-[#0B1220] mt-1 tabular-nums">
            {formatCurrency(obra.valorContrato)}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">Total orçado</p>
          <p className="font-newsreader text-[21px] font-semibold text-[#0B1220] mt-1 tabular-nums">
            {formatCurrency(obra.totalOrcado)}
          </p>
        </div>

        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">Total gasto</p>
          <p
            className={`font-newsreader text-[21px] font-semibold mt-1 tabular-nums ${
              alerta ? "text-[#C8434F]" : "text-[#0B1220]"
            }`}
          >
            {formatCurrency(obra.totalGasto)}
          </p>
          {percentual && (
            <p className={`text-[11.5px] mt-0.5 ${alerta ? "text-[#C8434F] font-medium" : "text-[#9AA7BD]"}`}>
              {percentual} do contrato
            </p>
          )}
        </div>

        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">Saldo</p>
          <p className="font-newsreader text-[21px] font-semibold text-[#0B1220] mt-1 tabular-nums">
            {formatCurrency(obra.saldo)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">Orçamentos</p>
          <Button
            size="sm"
            onClick={() => router.push(`/dashboard/obras/${obra.id}/orcamentos/nova`)}
            className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold shadow-[0_8px_18px_rgba(30,91,230,0.22)]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo orçamento
          </Button>
        </div>

        {loadingOrcamentos ? (
          <div className="flex flex-col gap-2">
            <div className="h-10 bg-[#F1F4F9] animate-pulse rounded-xl" />
            <div className="h-10 bg-[#F1F4F9] animate-pulse rounded-xl" />
          </div>
        ) : orcamentos.length === 0 ? (
          <p className="text-sm text-[#6B7891]">Nenhum orçamento ainda. Crie o primeiro.</p>
        ) : (
          <div className="rounded-2xl border border-[#EEF2F9] divide-y divide-[#EEF2F9] overflow-hidden">
            {orcamentos.map((orc) => (
              <div
                key={orc.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7FAFF] cursor-pointer transition-colors"
                onClick={() => router.push(`/dashboard/orcamentos/${orc.id}`)}
              >
                <span className="font-medium flex-1 text-[#0B1220] text-[14px]">{orc.titulo}</span>
                <span className="text-xs text-[#9AA7BD]">v{orc.versao}</span>
                <OrcamentoStatusBadge status={orc.status} />
                <span className="text-sm text-[#6B7891] w-24 text-right tabular-nums">
                  {orc.validadeAt
                    ? new Date(orc.validadeAt).toLocaleDateString("pt-BR")
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gastos recentes */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">Gastos recentes</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/obras/${obra.id}/relatorio`)}
              className="rounded-full border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
            >
              Relatório
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/obras/${obra.id}/gastos`)}
              className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold shadow-[0_8px_18px_rgba(30,91,230,0.22)]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Ver gastos
            </Button>
          </div>
        </div>

        {loadingGastos ? (
          <div className="flex flex-col gap-2">
            <div className="h-10 bg-[#F1F4F9] animate-pulse rounded-xl" />
            <div className="h-10 bg-[#F1F4F9] animate-pulse rounded-xl" />
          </div>
        ) : gastosRecentes.length === 0 ? (
          <p className="text-sm text-[#6B7891]">
            Nenhum gasto registrado.{" "}
            <button
              className="text-[#1E5BE6] font-medium hover:underline"
              onClick={() => router.push(`/dashboard/obras/${obra.id}/gastos/novo`)}
            >
              Registrar o primeiro
            </button>
          </p>
        ) : (
          <div className="rounded-2xl border border-[#EEF2F9] divide-y divide-[#EEF2F9] overflow-hidden">
            {gastosRecentes.map((g) => (
              <div
                key={g.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#F7FAFF] cursor-pointer transition-colors"
                onClick={() => router.push(`/dashboard/obras/${obra.id}/gastos`)}
              >
                <span className="font-medium flex-1 text-[#0B1220] text-[14px]">{g.descricao}</span>
                <span className="text-xs text-[#9AA7BD]">{CATEGORIA_LABELS[g.categoria]}</span>
                <span className="text-sm font-medium text-[#0B1220] tabular-nums">
                  {parseFloat(g.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            ))}
            {gastosRecentes.length === 3 && (
              <button
                className="text-xs text-[#1E5BE6] font-medium hover:underline text-left px-4 py-2.5 bg-white w-full"
                onClick={() => router.push(`/dashboard/obras/${obra.id}/gastos`)}
              >
                Ver todos os gastos →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
