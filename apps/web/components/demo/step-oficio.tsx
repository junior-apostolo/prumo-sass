"use client";

import type { TipoOficio } from "@enge-pro/shared";
import { cn } from "@/lib/utils";

interface Props {
  value: TipoOficio | null;
  onChange: (v: TipoOficio) => void;
}

const OFICIOS: { value: TipoOficio; label: string; sub: string; emoji: string }[] = [
  { value: "PINTURA", label: "Pintor", sub: "Paredes, teto, fachadas", emoji: "🖌️" },
  { value: "ELETRICA", label: "Eletricista", sub: "Pontos, quadros, circuitos", emoji: "⚡" },
  { value: "REVESTIMENTO", label: "Piso / Revestimento", sub: "Cerâmica, porcelanato, azulejo", emoji: "🪟" },
  { value: "HIDRAULICA", label: "Hidráulica", sub: "Instalações, reparos, tubulação", emoji: "🔧" },
  { value: "OUTRO", label: "Outro serviço", sub: "Gesso, drywall, marcenaria…", emoji: "🏗️" },
];

export function StepOficio({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="mb-2">
        <h2 className="font-newsreader text-[22px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Qual é o seu ofício?
        </h2>
        <p className="text-[14px] text-[#6B7891] mt-1">
          Vamos pré-preencher os serviços mais comuns para você.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OFICIOS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:border-[#1E5BE6] hover:bg-[#F7FAFF]",
              value === o.value
                ? "border-[#1E5BE6] bg-[#EEF3FF]"
                : "border-[#EEF2F9] bg-white"
            )}
          >
            <span className="text-3xl">{o.emoji}</span>
            <div>
              <p className="font-semibold text-sm text-[#0B1220]">{o.label}</p>
              <p className="text-xs text-[#6B7891]">{o.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
