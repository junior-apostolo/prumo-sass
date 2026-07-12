"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Cliente {
  nome: string;
  endereco: string;
}

interface Props {
  value: Cliente;
  onChange: (v: Cliente) => void;
}

export function StepCliente({ value, onChange }: Props) {
  function set(field: keyof Cliente, v: string) {
    onChange({ ...value, [field]: v });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-newsreader text-[22px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Dados do cliente
        </h2>
        <p className="text-[14px] text-[#6B7891] mt-1">
          Para quem é este orçamento?
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cli-nome" className="text-[13px] font-medium text-[#334155]">
          Nome do cliente *
        </Label>
        <Input
          id="cli-nome"
          placeholder="Ex: Maria Souza"
          value={value.nome}
          onChange={(e) => set("nome", e.target.value)}
          className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cli-end" className="text-[13px] font-medium text-[#334155]">
          Endereço da obra
        </Label>
        <Input
          id="cli-end"
          placeholder="Ex: Rua das Flores, 42 — Apto 3 — São Paulo, SP"
          value={value.endereco}
          onChange={(e) => set("endereco", e.target.value)}
          className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </div>
    </div>
  );
}
