import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimateIn } from "./animate-in";

const freePlan = {
  name: "Gratuito",
  price: "R$ 0",
  period: "/mês",
  items: [
    "2 obras ativas",
    "5 orçamentos por mês",
    "PDF sem logo da empresa",
    "Controle financeiro básico",
  ],
  cta: "Começar grátis",
  href: "/register",
  highlighted: false,
};

const proPlan = {
  name: "Pro",
  price: "R$ 89",
  period: "/mês",
  items: [
    "Obras ilimitadas",
    "Orçamentos ilimitados",
    "PDF com logo da sua empresa",
    "Controle financeiro completo com gráficos",
    "Exportação CSV",
    "Suporte prioritário",
  ],
  cta: "Assinar Pro",
  href: "/register",
  highlighted: true,
};

function PlanCard({ plan, delay }: { plan: typeof freePlan; delay: number }) {
  return (
    <AnimateIn delay={delay}>
      <div className="relative h-full pt-4">
        {plan.highlighted && (
          <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2">
            <Badge>Mais popular</Badge>
          </div>
        )}
        <Card
          className={cn(
            "flex h-full flex-col",
            plan.highlighted && "border-primary ring-2 ring-primary"
          )}
        >
        <CardHeader>
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-bold">{plan.price}</span>
            <span className="mb-1 text-sm text-muted-foreground">
              {plan.period}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-3">
            {plan.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Link
            href={plan.href}
            className={cn(
              buttonVariants({
                variant: plan.highlighted ? "default" : "outline",
                size: "lg",
              }),
              "w-full"
            )}
          >
            {plan.cta}
          </Link>
        </CardFooter>
        </Card>
      </div>
    </AnimateIn>
  );
}

export function PricingSection() {
  return (
    <section className="py-20" id="precos">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Simples e transparente
          </h2>
          <p className="mt-3 text-muted-foreground">
            Comece grátis. Escale quando precisar.
          </p>
        </AnimateIn>

        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
          <PlanCard plan={freePlan} delay={0} />
          <PlanCard plan={proPlan} delay={150} />
        </div>
      </div>
    </section>
  );
}
