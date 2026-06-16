import Link from "next/link";
import { Check } from "lucide-react";

export function DemoUsado() {
  return (
    <div className="flex flex-col items-center gap-10 py-6">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-2xl font-bold tracking-tight">
          Seu orçamento já foi gerado!
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
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

      <p className="text-xs text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="underline hover:text-foreground">
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
      className={`relative flex flex-col rounded-xl border p-6 gap-5 ${
        highlighted ? "border-primary ring-2 ring-primary" : ""
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          Mais popular
        </span>
      )}

      <div>
        <p className="font-semibold text-base">{name}</p>
        <p className="text-3xl font-bold mt-1">{price}</p>
      </div>

      <ul className="flex flex-col gap-2 flex-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          highlighted
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border hover:bg-muted"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
