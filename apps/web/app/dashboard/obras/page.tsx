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
          <div className="h-8 w-32 bg-[#F1F4F9] animate-pulse rounded-lg" />
          <div className="h-10 w-28 bg-[#F1F4F9] animate-pulse rounded-full" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-[#F1F4F9] animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
            Obras
          </h1>
          <p className="text-[#6B7891] text-[13.5px] mt-0.5">
            {obras.length} obra{obras.length !== 1 ? "s" : ""} ativa{obras.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/obras/nova")}
          className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold shadow-[0_10px_24px_rgba(30,91,230,0.24)] h-10 px-5"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nova obra
        </Button>
      </div>

      {obras.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <p className="text-[#6B7891] text-lg">Nenhuma obra cadastrada ainda.</p>
          <Button
            onClick={() => router.push("/dashboard/obras/nova")}
            className="rounded-full bg-[#1E5BE6] hover:bg-[#1a4ed4] text-white font-semibold shadow-[0_10px_24px_rgba(30,91,230,0.24)] h-10 px-5"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Criar primeira obra
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {obras.map((obra) => (
            <Card
              key={obra.id}
              className="cursor-pointer border-[#EEF2F9] rounded-2xl shadow-[0_10px_30px_rgba(20,50,120,0.06)] hover:shadow-[0_16px_40px_rgba(20,50,120,0.12)] hover:border-[#DCE6FA] transition-all"
              onClick={() => router.push(`/dashboard/obras/${obra.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug text-[#0B1220]">{obra.nome}</CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {obra.percentualConsumido !== null && obra.percentualConsumido > 80 && (
                      <Badge className="bg-[#FBE9EA] text-[#C8434F] hover:bg-[#FBE9EA] text-xs rounded-full">
                        Atenção
                      </Badge>
                    )}
                    <ObraStatusBadge status={obra.status} />
                  </div>
                </div>
                {obra.cliente && (
                  <p className="text-sm text-[#6B7891]">{obra.cliente}</p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-[#9AA7BD] text-[11.5px]">Contratado</span>
                    <p className="font-newsreader font-semibold text-[15px] text-[#0B1220]">
                      {formatCurrency(obra.valorContrato)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#9AA7BD] text-[11.5px]">Gasto</span>
                    <p className="font-newsreader font-semibold text-[15px] text-[#0B1220]">
                      {formatCurrency(obra.totalGasto)}
                    </p>
                  </div>
                  {obra.percentualConsumido !== null && (
                    <div className="col-span-2 mt-1.5">
                      <div className="flex items-center justify-between text-[11.5px] text-[#9AA7BD] mb-1">
                        <span>Consumido</span>
                        <span className={obra.percentualConsumido > 80 ? "text-[#C8434F] font-semibold" : "font-medium"}>
                          {formatPercent(obra.percentualConsumido)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#EEF3FF] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            obra.percentualConsumido > 80 ? "bg-[#C8434F]" : "bg-[#1E5BE6]"
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
