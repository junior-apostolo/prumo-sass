"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gastosApi, type ResumoFinanceiro, CATEGORIA_LABELS } from "@/lib/gastos";

function formatCurrency(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMes(mes: string) {
  const [year, month] = mes.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

function TooltipCurrency({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
      <p className="font-medium mb-1">{label}</p>
      <p>{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function RelatorioPage() {
  const { id } = useParams<{ id: string }>();
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gastosApi
      .getResumo(id)
      .then(setResumo)
      .catch(() => toast.error("Erro ao carregar relatório"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-4xl">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!resumo) return null;

  const categoriaData = resumo.porCategoria.map((c) => ({
    name: CATEGORIA_LABELS[c.categoria],
    total: c.total,
  }));

  const mesData = resumo.porMes.map((m) => ({
    name: formatMes(m.mes),
    total: m.total,
  }));

  const alerta = resumo.totalContrato !== null && resumo.totalContrato > 0
    && resumo.totalGasto / resumo.totalContrato > 0.8;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h2 className="text-xl font-semibold">Relatório financeiro</h2>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total contratado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-semibold">{formatCurrency(resumo.totalContrato)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total orçado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xl font-semibold">{formatCurrency(resumo.totalOrcado)}</p>
          </CardContent>
        </Card>

        <Card className={alerta ? "border-red-200" : ""}>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total gasto
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className={`text-xl font-semibold ${alerta ? "text-red-600" : ""}`}>
              {formatCurrency(resumo.totalGasto)}
            </p>
            {resumo.totalContrato && resumo.totalContrato > 0 && (
              <p className={`text-xs mt-0.5 ${alerta ? "text-red-500" : "text-muted-foreground"}`}>
                {((resumo.totalGasto / resumo.totalContrato) * 100).toFixed(1)}% do contrato
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparativo orçado vs. realizado */}
      <Card>
        <CardHeader className="px-6 pt-5 pb-3">
          <CardTitle className="text-sm font-semibold">Orçado vs. Realizado</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground">Métrica</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-2">Valor contratado</td>
                <td className="py-2 text-right font-medium">{formatCurrency(resumo.totalContrato)}</td>
              </tr>
              <tr>
                <td className="py-2">Total orçado (aprovados)</td>
                <td className="py-2 text-right font-medium">{formatCurrency(resumo.totalOrcado)}</td>
              </tr>
              <tr>
                <td className="py-2">Total gasto</td>
                <td className={`py-2 text-right font-semibold ${alerta ? "text-red-600" : ""}`}>
                  {formatCurrency(resumo.totalGasto)}
                </td>
              </tr>
              <tr>
                <td className="py-2">Saldo disponível</td>
                <td className={`py-2 text-right font-semibold ${resumo.saldo !== null && resumo.saldo < 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(resumo.saldo)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Gráfico por categoria */}
      {categoriaData.length > 0 && (
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoriaData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<TooltipCurrency />} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráfico evolução mensal */}
      {mesData.length > 0 && (
        <Card>
          <CardHeader className="px-6 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">Evolução mensal de gastos</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<TooltipCurrency />} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {categoriaData.length === 0 && mesData.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Nenhum gasto registrado para gerar gráficos.
        </p>
      )}
    </div>
  );
}
