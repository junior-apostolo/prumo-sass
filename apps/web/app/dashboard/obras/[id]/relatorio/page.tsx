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
    <div className="rounded-xl border border-[#E1E8F5] bg-white px-3 py-2 shadow-[0_10px_30px_rgba(20,50,120,0.10)] text-sm">
      <p className="text-[12px] text-[#6B7891] mb-0.5">{label}</p>
      <p className="font-newsreader font-semibold text-[#0B1220]">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD] mb-3">
      {children}
    </p>
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
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="h-8 w-48 bg-[#F1F4F9] animate-pulse rounded-lg" />
        <div className="h-16 bg-[#F1F4F9] animate-pulse rounded-xl" />
        <div className="h-64 bg-[#F1F4F9] animate-pulse rounded-2xl" />
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

  const saldoNegativo = resumo.saldo !== null && resumo.saldo < 0;

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <h1 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
        Relatório financeiro
      </h1>

      {/* Faixa de números-chave */}
      <div className="flex flex-wrap gap-x-10 gap-y-4 sm:divide-x sm:divide-[#EEF2F9]">
        <div className="sm:pr-10">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">
            Total contratado
          </p>
          <p className="font-newsreader text-[26px] font-semibold text-[#0B1220] mt-1 tabular-nums">
            {formatCurrency(resumo.totalContrato)}
          </p>
        </div>

        <div className="sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">
            Total orçado
          </p>
          <p className="font-newsreader text-[26px] font-semibold text-[#0B1220] mt-1 tabular-nums">
            {formatCurrency(resumo.totalOrcado)}
          </p>
        </div>

        <div className="sm:pl-10">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9AA7BD]">
            Total gasto
          </p>
          <p className={`font-newsreader text-[26px] font-semibold mt-1 tabular-nums ${alerta ? "text-[#C8434F]" : "text-[#0B1220]"}`}>
            {formatCurrency(resumo.totalGasto)}
          </p>
          {resumo.totalContrato && resumo.totalContrato > 0 && (
            <p className={`text-[12.5px] mt-0.5 ${alerta ? "text-[#C8434F] font-medium" : "text-[#6B7891]"}`}>
              {((resumo.totalGasto / resumo.totalContrato) * 100).toFixed(1)}% do contrato
            </p>
          )}
        </div>
      </div>

      {/* Comparativo orçado vs. realizado */}
      <div>
        <SectionLabel>Orçado vs. realizado</SectionLabel>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[#EEF2F9]">
            <tr>
              <td className="py-2.5 text-[#334155]">Valor contratado</td>
              <td className="py-2.5 text-right font-medium text-[#0B1220] tabular-nums">
                {formatCurrency(resumo.totalContrato)}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 text-[#334155]">Total orçado (aprovados)</td>
              <td className="py-2.5 text-right font-medium text-[#0B1220] tabular-nums">
                {formatCurrency(resumo.totalOrcado)}
              </td>
            </tr>
            <tr>
              <td className="py-2.5 text-[#334155]">Total gasto</td>
              <td className={`py-2.5 text-right font-semibold tabular-nums ${alerta ? "text-[#C8434F]" : "text-[#0B1220]"}`}>
                {formatCurrency(resumo.totalGasto)}
              </td>
            </tr>
            <tr className="bg-[#EEF3FF]">
              <td className="py-2.5 pl-2 rounded-l-xl font-semibold text-[#0B1220]">Saldo disponível</td>
              <td className={`py-2.5 pr-2 rounded-r-xl text-right font-newsreader font-semibold tabular-nums ${saldoNegativo ? "text-[#C8434F]" : "text-[#1F9D63]"}`}>
                {formatCurrency(resumo.saldo)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Gráfico por categoria */}
      {categoriaData.length > 0 && (
        <div>
          <SectionLabel>Gastos por categoria</SectionLabel>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoriaData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9AA7BD" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9AA7BD" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TooltipCurrency />} cursor={{ fill: "#F7FAFF" }} />
              <Bar dataKey="total" fill="#1E5BE6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico evolução mensal */}
      {mesData.length > 0 && (
        <div>
          <SectionLabel>Evolução mensal de gastos</SectionLabel>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={mesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "#9AA7BD" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9AA7BD" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TooltipCurrency />} cursor={{ stroke: "#E1E8F5" }} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#1E5BE6"
                strokeWidth={2.5}
                dot={{ fill: "#1E5BE6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {categoriaData.length === 0 && mesData.length === 0 && (
        <p className="text-[14px] text-[#6B7891]">
          Nenhum gasto registrado para gerar gráficos.
        </p>
      )}
    </div>
  );
}
