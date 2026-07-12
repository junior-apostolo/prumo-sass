import { Badge } from "@/components/ui/badge";
import type { OrcamentoStatus } from "@/lib/orcamentos";

const STATUS_CONFIG: Record<OrcamentoStatus, { label: string; className: string }> = {
  RASCUNHO: { label: "Rascunho", className: "bg-[#F1F4F9] text-[#6B7891] hover:bg-[#F1F4F9]" },
  ENVIADO: { label: "Enviado", className: "bg-[#EEF3FF] text-[#1E5BE6] hover:bg-[#EEF3FF]" },
  APROVADO: { label: "Aprovado", className: "bg-[#E8F7EF] text-[#1F9D63] hover:bg-[#E8F7EF]" },
  RECUSADO: { label: "Recusado", className: "bg-[#FBE9EA] text-[#C8434F] hover:bg-[#FBE9EA]" },
};

export function OrcamentoStatusBadge({ status }: { status: OrcamentoStatus }) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`rounded-full border-transparent ${className}`}>
      {label}
    </Badge>
  );
}
