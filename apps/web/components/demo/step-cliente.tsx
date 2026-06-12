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
        <h2 className="text-xl font-semibold">Dados do cliente</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Para quem é este orçamento?
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cli-nome">Nome do cliente *</Label>
        <Input
          id="cli-nome"
          placeholder="Ex: Maria Souza"
          value={value.nome}
          onChange={(e) => set("nome", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cli-end">Endereço da obra</Label>
        <Input
          id="cli-end"
          placeholder="Ex: Rua das Flores, 42 — Apto 3 — São Paulo, SP"
          value={value.endereco}
          onChange={(e) => set("endereco", e.target.value)}
        />
      </div>
    </div>
  );
}
