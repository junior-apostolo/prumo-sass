"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { obrasApi, type ObraComResumo, type ObraStatus } from "@/lib/obras";

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

export default function ObraDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [obra, setObra] = useState<ObraComResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

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
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!obra) return null;

  const percentual = formatPercent(obra.percentualConsumido);
  const alerta = obra.percentualConsumido !== null && obra.percentualConsumido > 80;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">{obra.nome}</h1>
            <ObraStatusBadge status={obra.status} />
            {alerta && (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                Atenção: {percentual} consumido
              </Badge>
            )}
          </div>
          {obra.cliente && <p className="text-muted-foreground">{obra.cliente}</p>}
          {obra.endereco && <p className="text-sm text-muted-foreground">{obra.endereco}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
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
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            Editar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="outline" size="sm" disabled={archiving} />}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contratado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-semibold">{formatCurrency(obra.valorContrato)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total orçado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-semibold">{formatCurrency(obra.totalOrcado)}</p>
          </CardContent>
        </Card>

        <Card className={alerta ? "border-red-200" : ""}>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total gasto
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className={`text-xl font-semibold ${alerta ? "text-red-600" : ""}`}>
              {formatCurrency(obra.totalGasto)}
            </p>
            {percentual && (
              <p className={`text-xs mt-0.5 ${alerta ? "text-red-500" : "text-muted-foreground"}`}>
                {percentual} do contrato
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-semibold">{formatCurrency(obra.saldo)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
