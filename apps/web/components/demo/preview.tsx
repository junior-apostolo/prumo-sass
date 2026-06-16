"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { gerarOrcamentoPdf, downloadBlob } from "@/lib/demo-api";
import { OFICIO_LABELS } from "@/lib/demo-precos";
import type { TipoOficio, DemoWizardPayload } from "@enge-pro/shared";
import type { ServicoState } from "./step-servicos";

interface Props {
  oficio: TipoOficio;
  prestador: { nome: string; cpfCnpj: string; telefone: string };
  cliente: { nome: string; endereco: string };
  servicos: ServicoState;
  condicoes: { pagamento: string; validadeDias: number; observacoes: string };
}

function formatBRL(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export function Preview({ oficio, prestador, cliente, servicos, condicoes }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gerado, setGerado] = useState(false);

  useEffect(() => {
    if (gerado) {
      router.push("/#precos");
    }
  }, [gerado, router]);

  const itensAtivos =
    servicos.modo === "wizard"
      ? servicos.itens.filter((i) => i.checked && i.quantidade > 0)
      : [];

  const total =
    servicos.modo === "wizard"
      ? itensAtivos.reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0)
      : parseFloat(servicos.verba.valorTotal) || 0;

  async function handleGerar() {
    setLoading(true);
    try {
      const payload: DemoWizardPayload = {
        oficio,
        modoServico: servicos.modo,
        prestador: {
          nome: prestador.nome,
          cpfCnpj: prestador.cpfCnpj || undefined,
          telefone: prestador.telefone || undefined,
        },
        cliente: {
          nome: cliente.nome,
          endereco: cliente.endereco || undefined,
        },
        itens:
          servicos.modo === "wizard"
            ? itensAtivos.map(({ descricao, unidade, quantidade, valorUnitario }) => ({
                descricao,
                unidade,
                quantidade,
                valorUnitario,
              }))
            : undefined,
        verba:
          servicos.modo === "verba"
            ? {
                descricao: servicos.verba.descricao,
                valorTotal: parseFloat(servicos.verba.valorTotal) || 0,
              }
            : undefined,
        pagamento: condicoes.pagamento || undefined,
        validadeDias: condicoes.validadeDias,
        observacoes: condicoes.observacoes || undefined,
      };

      const blob = await gerarOrcamentoPdf(payload);
      downloadBlob(blob, "orcamento-prumo.pdf");
      setGerado(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold">Pronto para gerar!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confira o resumo antes de baixar o PDF.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border divide-y text-sm">
        <div className="flex justify-between px-4 py-3">
          <span className="text-muted-foreground">Ofício</span>
          <span className="font-medium">{OFICIO_LABELS[oficio]}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-muted-foreground">Prestador</span>
          <span className="font-medium">{prestador.nome}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-muted-foreground">Cliente</span>
          <span className="font-medium">{cliente.nome}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-muted-foreground">
            {servicos.modo === "wizard" ? "Itens de serviço" : "Modo"}
          </span>
          <span className="font-medium">
            {servicos.modo === "wizard"
              ? `${itensAtivos.length} item${itensAtivos.length !== 1 ? "s" : ""}`
              : "Preço fechado"}
          </span>
        </div>
        {condicoes.pagamento && (
          <div className="flex justify-between px-4 py-3">
            <span className="text-muted-foreground">Pagamento</span>
            <span className="font-medium text-right max-w-[60%]">{condicoes.pagamento}</span>
          </div>
        )}
        <div className="flex justify-between px-4 py-3">
          <span className="text-muted-foreground">Validade</span>
          <span className="font-medium">{condicoes.validadeDias} dias</span>
        </div>
        <div className="flex justify-between px-4 py-3 bg-primary/5 rounded-b-xl">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-primary text-base">{formatBRL(total)}</span>
        </div>
      </div>

      <Button
        onClick={handleGerar}
        disabled={loading || gerado}
        size="lg"
        className="w-full text-base"
      >
        {loading ? "Gerando PDF…" : gerado ? "Redirecionando…" : "⬇ Baixar orçamento em PDF"}
      </Button>
    </div>
  );
}
