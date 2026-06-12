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
        <h2 className="text-xl font-semibold">Seus dados</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Aparecerão no cabeçalho do orçamento.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prest-nome">Seu nome ou nome da empresa *</Label>
        <Input
          id="prest-nome"
          placeholder="Ex: João Silva Pinturas"
          value={value.nome}
          onChange={(e) => set("nome", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prest-cpf">CPF ou CNPJ (MEI)</Label>
        <Input
          id="prest-cpf"
          placeholder="000.000.000-00 ou 00.000.000/0001-00"
          value={value.cpfCnpj}
          onChange={(e) => set("cpfCnpj", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Deixar visível transmite mais credibilidade ao cliente.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prest-tel">WhatsApp / Telefone</Label>
        <Input
          id="prest-tel"
          placeholder="(11) 99999-9999"
          value={value.telefone}
          onChange={(e) => set("telefone", e.target.value)}
        />
      </div>
    </div>
  );
}
