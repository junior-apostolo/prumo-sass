import Link from "next/link";
import { Check } from "lucide-react";

export function DemoUsado() {
  return (
    <div className="flex flex-col items-center gap-10 py-6">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-newsreader text-[26px] font-medium tracking-[-0.01em] text-[#0B1220]">
          Seu orçamento já foi gerado!
        </h2>
        <p className="text-[#6B7891] mt-2 text-[14.5px] leading-relaxed">
          A demonstração gratuita é de uso único. Crie uma conta para gerar
          orçamentos ilimitados, salvar clientes e acessar o controle financeiro
          completo.
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
        <PlanCard
          name="Gratuito"
          price="R$ 0"
          items={[
            "2 obras ativas",
            "5 orçamentos por mês",
            "PDF sem logo da empresa",
            "Controle financeiro básico",
          ]}
          ctaLabel="Criar conta grátis"
          ctaHref="/register"
          highlighted={false}
        />
        <PlanCard
          name="Pro"
          price="R$ 89/mês"
          items={[
            "Obras ilimitadas",
            "Orçamentos ilimitados",
            "PDF com logo da sua empresa",
            "Controle financeiro com gráficos",
            "Exportação CSV",
            "Suporte prioritário",
          ]}
          ctaLabel="Assinar Pro"
          ctaHref="/register"
          highlighted
        />
      </div>

      <p className="text-xs text-[#7C8AA0]">
        Já tem conta?{" "}
        <Link href="/login" className="text-[#1E5BE6] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

interface PlanCardProps {
  name: string;
  price: string;
  items: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted: boolean;
}

function PlanCard({ name, price, items, ctaLabel, ctaHref, highlighted }: PlanCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 gap-5 ${
        highlighted
          ? "border-[#1E5BE6] ring-2 ring-[#1E5BE6]/20 shadow-[0_20px_50px_rgba(20,50,120,0.10)]"
          : "border-[#EEF2F9]"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1E5BE6] px-3 py-0.5 text-xs font-semibold text-white">
          Mais popular
        </span>
      )}

      <div>
        <p className="font-semibold text-base text-[#0B1220]">{name}</p>
        <p className="font-newsreader text-3xl font-semibold mt-1 text-[#0B1220]">{price}</p>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[#334155]">
            <Check className="mt-0.5 size-4 shrink-0 text-[#1E5BE6]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors no-underline ${
          highlighted
            ? "bg-[#1E5BE6] text-white hover:bg-[#1a4ed4] shadow-[0_10px_24px_rgba(30,91,230,0.24)]"
            : "border border-[#E1E8F5] text-[#334155] hover:bg-[#F7FAFF]"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
