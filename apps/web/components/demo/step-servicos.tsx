"use client";

import { useState } from "react";
import type { TipoOficio } from "@enge-pro/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRECOS_PADRAO, OFICIO_LABELS } from "@/lib/demo-precos";

export interface WizardItem {
  id: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  checked: boolean;
}

export interface ServicoState {
  modo: "wizard" | "verba";
  itens: WizardItem[];
  verba: { descricao: string; valorTotal: string };
}

interface Props {
  oficio: TipoOficio;
  value: ServicoState;
  onChange: (v: ServicoState) => void;
}

function formatBRL(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function initItens(oficio: TipoOficio): WizardItem[] {
  return PRECOS_PADRAO[oficio].map((p) => ({
    id: p.id,
    descricao: p.descricao,
    unidade: p.unidade,
    quantidade: p.quantidadeDefault,
    valorUnitario: p.precoDefault,
    checked: p.checkedDefault,
  }));
}

export function getInitialServicoState(oficio: TipoOficio): ServicoState {
  return {
    modo: "wizard",
    itens: initItens(oficio),
    verba: { descricao: "", valorTotal: "" },
  };
}

export function StepServicos({ oficio, value, onChange }: Props) {
  const [novaDescricao, setNovaDescricao] = useState("");

  const total = value.itens
    .filter((i) => i.checked && i.quantidade > 0)
    .reduce((acc, i) => acc + i.quantidade * i.valorUnitario, 0);

  function setModo(modo: "wizard" | "verba") {
    onChange({ ...value, modo });
  }

  function toggleItem(id: string) {
    onChange({
      ...value,
      itens: value.itens.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    });
  }

  function updateItem(id: string, field: "quantidade" | "valorUnitario", raw: string) {
    const n = parseFloat(raw.replace(",", ".")) || 0;
    onChange({
      ...value,
      itens: value.itens.map((item) =>
        item.id === id ? { ...item, [field]: n } : item
      ),
    });
  }

  function addCustomItem() {
    if (!novaDescricao.trim()) return;
    const novo: WizardItem = {
      id: `custom-${Date.now()}`,
      descricao: novaDescricao.trim(),
      unidade: "verba",
      quantidade: 1,
      valorUnitario: 0,
      checked: true,
    };
    onChange({ ...value, itens: [...value.itens, novo] });
    setNovaDescricao("");
  }

  function removeItem(id: string) {
    onChange({ ...value, itens: value.itens.filter((i) => i.id !== id) });
  }

  function setVerba(field: keyof ServicoState["verba"], v: string) {
    onChange({ ...value, verba: { ...value.verba, [field]: v } });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-newsreader text-[22px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Serviços — {OFICIO_LABELS[oficio]}
        </h2>
        <p className="text-[14px] text-[#6B7891] mt-1">
          Selecione e ajuste os itens, ou informe um preço fechado.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-full border border-[#E1E8F5] overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => setModo("wizard")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium transition-colors",
            value.modo === "wizard"
              ? "bg-[#1E5BE6] text-white"
              : "bg-white text-[#6B7891] hover:bg-[#F7FAFF]"
          )}
        >
          Detalhado (por item)
        </button>
        <button
          type="button"
          onClick={() => setModo("verba")}
          className={cn(
            "px-4 py-1.5 text-sm font-medium transition-colors",
            value.modo === "verba"
              ? "bg-[#1E5BE6] text-white"
              : "bg-white text-[#6B7891] hover:bg-[#F7FAFF]"
          )}
        >
          Preço fechado (verba)
        </button>
      </div>

      {value.modo === "wizard" ? (
        <>
          <p className="text-xs text-[#9AA7BD] -mt-1">
            Valores de referência — ajuste para sua região.
          </p>

          <div className="flex flex-col gap-2">
            {value.itens.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  item.checked ? "border-[#1E5BE6]/40 bg-[#EEF3FF]" : "border-[#EEF2F9] bg-white opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(item.id)}
                    className="mt-0.5 h-4 w-4 accent-[#1E5BE6] cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight text-[#0B1220]">{item.descricao}</p>
                    {item.checked && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-[#6B7891]">
                            Qtd ({item.unidade})
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantidade || ""}
                            onChange={(e) => updateItem(item.id, "quantidade", e.target.value)}
                            className="h-8 text-sm rounded-lg border-[#E1E8F5] focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-[#6B7891]">
                            Preço / {item.unidade}
                          </label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.valorUnitario || ""}
                            onChange={(e) => updateItem(item.id, "valorUnitario", e.target.value)}
                            className="h-8 text-sm rounded-lg border-[#E1E8F5] focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {item.id.startsWith("custom-") && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[#9AA7BD] hover:text-[#C8434F] text-xs flex-shrink-0"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {item.checked && item.quantidade > 0 && (
                  <p className="text-xs text-right font-medium text-[#1E5BE6] mt-1">
                    = {formatBRL(item.quantidade * item.valorUnitario)}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Add custom item */}
          <div className="flex gap-2">
            <Input
              placeholder="+ Adicionar serviço personalizado"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
              className="text-sm h-10 rounded-xl border-[#E1E8F5] focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomItem}
              className="rounded-xl border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
            >
              Adicionar
            </Button>
          </div>

          {/* Running total */}
          {total > 0 && (
            <div className="rounded-xl bg-[#1E5BE6] text-white px-4 py-3 flex justify-between items-center shadow-[0_10px_24px_rgba(30,91,230,0.24)]">
              <span className="text-sm font-medium">Total orçado</span>
              <span className="font-newsreader text-lg font-semibold">{formatBRL(total)}</span>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verba-desc" className="text-[13px] font-medium text-[#334155]">
              Descrição do serviço *
            </Label>
            <textarea
              id="verba-desc"
              rows={3}
              placeholder="Ex: Pintura completa do apartamento incluindo paredes, teto e rodapés. Material não incluso."
              value={value.verba.descricao}
              onChange={(e) => setVerba("descricao", e.target.value)}
              className="flex min-h-[80px] w-full rounded-xl border border-[#E1E8F5] bg-white px-3.5 py-2.5 text-sm placeholder:text-[#9AA7BD] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1E5BE6]/15 focus-visible:border-[#1E5BE6] resize-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verba-val" className="text-[13px] font-medium text-[#334155]">
              Valor total (R$) *
            </Label>
            <Input
              id="verba-val"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={value.verba.valorTotal}
              onChange={(e) => setVerba("valorTotal", e.target.value)}
              className="h-11 rounded-xl border-[#E1E8F5] px-3.5 focus-visible:border-[#1E5BE6] focus-visible:ring-[#1E5BE6]/15"
            />
          </div>
          {parseFloat(value.verba.valorTotal) > 0 && (
            <div className="rounded-xl bg-[#1E5BE6] text-white px-4 py-3 flex justify-between items-center shadow-[0_10px_24px_rgba(30,91,230,0.24)]">
              <span className="text-sm font-medium">Total do orçamento</span>
              <span className="font-newsreader text-lg font-semibold">
                {formatBRL(parseFloat(value.verba.valorTotal))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
