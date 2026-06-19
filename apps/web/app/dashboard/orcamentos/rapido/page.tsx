"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepOficio } from "@/components/demo/step-oficio";
import {
  StepServicos,
  getInitialServicoState,
  type ServicoState,
} from "@/components/demo/step-servicos";
import { StepCondicoes } from "@/components/demo/step-condicoes";
import { orcamentosApi } from "@/lib/orcamentos";
import { downloadBlob } from "@/lib/demo-api";
import type { TipoOficio } from "@enge-pro/shared";

type Condicoes = { pagamento: string; validadeDias: number; observacoes: string };

export default function OrcamentoRapidoPage() {
  const [oficio, setOficio] = useState<TipoOficio | null>(null);
  const [servicos, setServicos] = useState<ServicoState | null>(null);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState("");
  const [condicoes, setCondicoes] = useState<Condicoes>({
    pagamento: "",
    validadeDias: 15,
    observacoes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  function handleOficioChange(novoOficio: TipoOficio) {
    setOficio(novoOficio);
    setServicos(getInitialServicoState(novoOficio));
  }

  const totalGeral =
    servicos?.modo === "verba"
      ? parseFloat(servicos.verba.valorTotal) || 0
      : (servicos?.itens ?? [])
          .filter((i) => i.checked && i.quantidade > 0)
          .reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0);

  function formatBRL(n: number) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
  }

  function buildPayload() {
    if (!oficio || !servicos) return null;

    const base = {
      oficio,
      modoServico: servicos.modo,
      cliente: {
        nome: clienteNome.trim(),
        endereco: clienteEndereco.trim() || undefined,
      },
      pagamento: condicoes.pagamento.trim() || undefined,
      validadeDias: condicoes.validadeDias,
      observacoes: condicoes.observacoes.trim() || undefined,
    };

    if (servicos.modo === "verba") {
      return {
        ...base,
        verba: {
          descricao: servicos.verba.descricao.trim(),
          valorTotal: parseFloat(servicos.verba.valorTotal) || 0,
        },
      };
    }

    return {
      ...base,
      itens: servicos.itens
        .filter((i) => i.checked && i.quantidade > 0)
        .map(({ descricao, unidade, quantidade, valorUnitario }) => ({
          descricao,
          unidade,
          quantidade,
          valorUnitario,
        })),
    };
  }

  function isValid(): boolean {
    if (!oficio || !servicos || !clienteNome.trim()) return false;
    if (servicos.modo === "verba") {
      return (
        servicos.verba.descricao.trim().length > 0 &&
        parseFloat(servicos.verba.valorTotal) > 0
      );
    }
    return servicos.itens.some((i) => i.checked && i.quantidade > 0);
  }

  async function handleGerar() {
    const payload = buildPayload();
    if (!payload) return;
    setIsLoading(true);
    try {
      const blob = await orcamentosApi.gerarRapido(payload);
      const hoje = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `orcamento-rapido-${hoje}.pdf`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orçamento Rápido</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gere um PDF profissional com os preços do seu segmento. Nada é salvo.
        </p>
      </div>

      {/* ── 1. Ofício ── */}
      <Card>
        <CardContent className="pt-6">
          <StepOficio value={oficio} onChange={handleOficioChange} />
        </CardContent>
      </Card>

      {/* ── 2. Serviços (aparece após ofício selecionado) ── */}
      {oficio && servicos && (
        <Card>
          <CardContent className="pt-6">
            <StepServicos oficio={oficio} value={servicos} onChange={setServicos} />
          </CardContent>
        </Card>
      )}

      {/* ── 3. Cliente ── */}
      {oficio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cliente-nome">Nome / Razão social *</Label>
              <Input
                id="cliente-nome"
                placeholder="Ex: João Silva"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cliente-endereco">Endereço da obra (opcional)</Label>
              <Input
                id="cliente-endereco"
                placeholder="Ex: Rua das Flores, 123 — São Paulo, SP"
                value={clienteEndereco}
                onChange={(e) => setClienteEndereco(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 4. Condições ── */}
      {oficio && (
        <Card>
          <CardContent className="pt-6">
            <StepCondicoes value={condicoes} onChange={setCondicoes} />
          </CardContent>
        </Card>
      )}

      {/* ── Barra fixa de total + ação ── */}
      {oficio && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total estimado</p>
              <p className="text-xl font-bold tabular-nums">{formatBRL(totalGeral)}</p>
            </div>
            <Button
              size="lg"
              onClick={handleGerar}
              disabled={!isValid() || isLoading}
              className="min-w-36"
            >
              {isLoading ? "Gerando PDF..." : "Gerar PDF"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
