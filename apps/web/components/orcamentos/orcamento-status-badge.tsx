import { Badge } from "@/components/ui/badge";
import type { OrcamentoStatus } from "@/lib/orcamentos";

const STATUS_CONFIG: Record<OrcamentoStatus, { label: string; className: string }> = {
  RASCUNHO: { label: "Rascunho", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
  ENVIADO: { label: "Enviado", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  APROVADO: { label: "Aprovado", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  RECUSADO: { label: "Recusado", className: "bg-red-100 text-red-700 hover:bg-red-100" },
};

export function OrcamentoStatusBadge({ status }: { status: OrcamentoStatus }) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
