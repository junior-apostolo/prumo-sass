import { Badge } from "@/components/ui/badge";
import type { ObraStatus } from "@/lib/obras";

const STATUS_CONFIG: Record<ObraStatus, { label: string; className: string }> = {
  PLANEJAMENTO: { label: "Planejamento", className: "bg-[#F1F4F9] text-[#6B7891] hover:bg-[#F1F4F9]" },
  EM_EXECUCAO: { label: "Em execução", className: "bg-[#EEF3FF] text-[#1E5BE6] hover:bg-[#EEF3FF]" },
  PAUSADA: { label: "Pausada", className: "bg-[#FDF3E3] text-[#B8791F] hover:bg-[#FDF3E3]" },
  CONCLUIDA: { label: "Concluída", className: "bg-[#E8F7EF] text-[#1F9D63] hover:bg-[#E8F7EF]" },
};

export function ObraStatusBadge({ status }: { status: ObraStatus }) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={`rounded-full border-transparent ${className}`}>
      {label}
    </Badge>
  );
}
