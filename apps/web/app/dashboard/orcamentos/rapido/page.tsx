"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="max-w-2xl mx-auto pb-32">
      <div>
        <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Orçamento Rápido
        </h1>
        <p className="text-[#6B7891] text-[13.5px] mt-1">
          Gere um PDF profissional com os preços do seu segmento. Nada é salvo.
        </p>
      </div>

      {/* ── 1. Ofício ── */}
      <div className="mt-8 pt-8 border-t border-[#EEF2F9] first:mt-6 first:pt-0 first:border-t-0">
        <StepOficio value={oficio} onChange={handleOficioChange} />
      </div>

      {/* ── 2. Serviços (aparece após ofício selecionado) ── */}
      {oficio && servicos && (
        <div className="mt-8 pt-8 border-t border-[#EEF2F9]">
          <StepServicos oficio={oficio} value={servicos} onChange={setServicos} />
        </div>
      )}

      {/* ── 3. Cliente ── */}
      {oficio && (
        <div className="mt-8 pt-8 border-t border-[#EEF2F9] flex flex-col gap-4">
          <div>
            <h2 className="font-newsreader text-[20px] font-medium tracking-[-0.01em] text-[#0B1220]">
              Dados do cliente
            </h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente-nome" className="text-[13px] font-medium text-[#334155]">
              Nome / Razão social *
            </Label>
            <Input
              id="cliente-nome"
              placeholder="Ex: João Silva"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente-endereco" className="text-[13px] font-medium text-[#334155]">
              Endereço da obra (opcional)
            </Label>
            <Input
              id="cliente-endereco"
              placeholder="Ex: Rua das Flores, 123 — São Paulo, SP"
              value={clienteEndereco}
              onChange={(e) => setClienteEndereco(e.target.value)}
              className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
            />
          </div>
        </div>
      )}

      {/* ── 4. Condições ── */}
      {oficio && (
        <div className="mt-8 pt-8 border-t border-[#EEF2F9]">
          <StepCondicoes value={condicoes} onChange={setCondicoes} />
        </div>
      )}

      {/* ── Barra fixa de total + ação ── */}
      {oficio && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-[#EEF2F9] bg-white/95 backdrop-blur-sm px-6 py-4 shadow-[0_-8px_30px_rgba(20,50,120,0.08)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-[11.5px] uppercase tracking-[0.06em] font-semibold text-[#9AA7BD]">
                Total estimado
              </p>
              <p className="font-newsreader text-[22px] font-semibold tabular-nums text-[#0B1220]">
                {formatBRL(totalGeral)}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleGerar}
              disabled={!isValid() || isLoading}
              className="min-w-36 rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold shadow-[0_10px_24px_rgba(30,91,230,0.28)]"
            >
              {isLoading ? "Gerando PDF..." : "Gerar PDF"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
