"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ObraStatusBadge } from "@/components/obras/obra-status-badge";
import { obrasApi, type ObraComResumo } from "@/lib/obras";

function formatCurrency(value: number | string | null) {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPercent(value: number | null) {
  if (value === null) return "—";
  return `${value.toFixed(1)}%`;
}

export default function ObrasPage() {
  const router = useRouter();
  const [obras, setObras] = useState<ObraComResumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obrasApi
      .list()
      .then(setObras)
      .catch(() => toast.error("Erro ao carregar obras"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-9 w-28 bg-muted animate-pulse rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Obras</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{obras.length} obra{obras.length !== 1 ? "s" : ""} ativa{obras.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => router.push("/dashboard/obras/nova")}>
          <Plus className="w-4 h-4 mr-2" />
          Nova obra
        </Button>
      </div>

      {obras.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <p className="text-muted-foreground text-lg">Nenhuma obra cadastrada ainda.</p>
          <Button onClick={() => router.push("/dashboard/obras/nova")}>
            <Plus className="w-4 h-4 mr-2" />
            Criar primeira obra
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {obras.map((obra) => (
            <Card
              key={obra.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/dashboard/obras/${obra.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{obra.nome}</CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {obra.percentualConsumido !== null && obra.percentualConsumido > 80 && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                        Atenção
                      </Badge>
                    )}
                    <ObraStatusBadge status={obra.status} />
                  </div>
                </div>
                {obra.cliente && (
                  <p className="text-sm text-muted-foreground">{obra.cliente}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Contratado</span>
                    <p className="font-medium">{formatCurrency(obra.valorContrato)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gasto</span>
                    <p className="font-medium">{formatCurrency(obra.totalGasto)}</p>
                  </div>
                  {obra.percentualConsumido !== null && (
                    <div className="col-span-2 mt-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Consumido</span>
                        <span className={obra.percentualConsumido > 80 ? "text-red-600 font-medium" : ""}>
                          {formatPercent(obra.percentualConsumido)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            obra.percentualConsumido > 80 ? "bg-red-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(obra.percentualConsumido, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
