import { Badge } from "@/components/ui/badge";
import type { ObraStatus } from "@/lib/obras";

const STATUS_CONFIG: Record<ObraStatus, { label: string; className: string }> = {
  PLANEJAMENTO: { label: "Planejamento", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  EM_EXECUCAO: { label: "Em execução", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  PAUSADA: { label: "Pausada", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  CONCLUIDA: { label: "Concluída", className: "bg-green-100 text-green-700 hover:bg-green-100" },
};

export function ObraStatusBadge({ status }: { status: ObraStatus }) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
