"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Prestador {
  nome: string;
  cpfCnpj: string;
  telefone: string;
}

interface Props {
  value: Prestador;
  onChange: (v: Prestador) => void;
}

export function StepPrestador({ value, onChange }: Props) {
  function set(field: keyof Prestador, v: string) {
    onChange({ ...value, [field]: v });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-newsreader text-[22px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Seus dados
        </h2>
        <p className="text-[14px] text-[#6B7891] mt-1">
          Aparecerão no cabeçalho do orçamento.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prest-nome" className="text-[13px] font-medium text-[#334155]">
          Seu nome ou nome da empresa *
        </Label>
        <Input
          id="prest-nome"
          placeholder="Ex: João Silva Pinturas"
          value={value.nome}
          onChange={(e) => set("nome", e.target.value)}
          className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prest-cpf" className="text-[13px] font-medium text-[#334155]">
          CPF ou CNPJ (MEI)
        </Label>
        <Input
          id="prest-cpf"
          placeholder="000.000.000-00 ou 00.000.000/0001-00"
          value={value.cpfCnpj}
          onChange={(e) => set("cpfCnpj", e.target.value)}
          className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
        <p className="text-xs text-[#9AA7BD]">
          Deixar visível transmite mais credibilidade ao cliente.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prest-tel" className="text-[13px] font-medium text-[#334155]">
          WhatsApp / Telefone
        </Label>
        <Input
          id="prest-tel"
          placeholder="(11) 99999-9999"
          value={value.telefone}
          onChange={(e) => set("telefone", e.target.value)}
          className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
        />
      </div>
    </div>
  );
}
