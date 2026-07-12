"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Condicoes {
  pagamento: string;
  validadeDias: number;
  observacoes: string;
}

interface Props {
  value: Condicoes;
  onChange: (v: Condicoes) => void;
}

const PAGAMENTO_OPCOES = [
  "À vista na conclusão",
  "50% na aprovação, 50% na entrega",
  "30% entrada, 70% na entrega",
  "Por etapa",
];

export function StepCondicoes({ value, onChange }: Props) {
  function set(field: keyof Condicoes, v: string | number) {
    onChange({ ...value, [field]: v });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-newsreader text-[22px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Condições do orçamento
        </h2>
        <p className="text-[14px] text-[#6B7891] mt-1">
          Essas informações aparecem no PDF e deixam o orçamento mais profissional.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-[13px] font-medium text-[#334155]">Condições de pagamento</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PAGAMENTO_OPCOES.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => set("pagamento", op)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm text-left transition-all",
                value.pagamento === op
                  ? "border-[#1E5BE6] bg-[#EEF3FF] font-medium text-[#0B1220]"
                  : "border-[#EEF2F9] text-[#334155] hover:border-[#1E5BE6]/50"
              )}
            >
              {op}
            </button>
          ))}
        </div>
        <Input
          placeholder="Ou descreva suas condições..."
          value={value.pagamento}
          onChange={(e) => set("pagamento", e.target.value)}
          className="mt-1 h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="validade" className="text-[13px] font-medium text-[#334155]">
          Validade do orçamento (dias)
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="validade"
            type="number"
            min="1"
            max="365"
            value={value.validadeDias}
            onChange={(e) => set("validadeDias", parseInt(e.target.value) || 10)}
            className="w-28 h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
          />
          <span className="text-sm text-[#6B7891]">dias corridos</span>
        </div>
        <p className="text-xs text-[#9AA7BD]">
          Padrão do mercado: 7–15 dias. Após a validade, preços podem ser reajustados.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="obs" className="text-[13px] font-medium text-[#334155]">
          Observações (opcional)
        </Label>
        <textarea
          id="obs"
          rows={3}
          placeholder="Ex: Material não incluso no valor. Limpeza do local por conta do cliente. Garantia de 90 dias."
          value={value.observacoes}
          onChange={(e) => set("observacoes", e.target.value)}
          className="flex min-h-[80px] w-full rounded-xl border border-[#E1E8F5] bg-white px-3.5 py-2.5 text-sm placeholder:text-[#9AA7BD] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1E5BE6]/15 focus-visible:border-[#1E5BE6] resize-none"
        />
        <p className="text-xs text-[#9AA7BD]">
          Dica: deixe claro o que NÃO está incluso para evitar conflitos.
        </p>
      </div>
    </div>
  );
}
