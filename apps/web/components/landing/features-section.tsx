import { Building2, FileCheck, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimateIn } from "./animate-in";

const features = [
  {
    icon: Building2,
    title: "Gestão de Obras",
    description:
      "Cadastre obras, acompanhe o status — Planejamento → Em execução → Concluída — e monitore o custo em tempo real. Sabe em segundos quanto falta para estourar o orçamento.",
  },
  {
    icon: FileCheck,
    title: "Orçamentos em PDF",
    description:
      "Monte o orçamento por categoria (material, mão de obra, equipamento) e gere um PDF profissional com a sua logo. Envie para o cliente em menos de 3 minutos.",
  },
  {
    icon: BarChart3,
    title: "Controle Financeiro",
    description:
      "Registre cada gasto e veja o comparativo de orçado vs. realizado em gráficos. Alerta automático quando os gastos passam de 80% do contrato.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20" id="funcionalidades">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Tudo que você precisa, sem curva de aprendizado
          </h2>
          <p className="mt-3 text-muted-foreground">
            Três ferramentas integradas para você gerenciar obras como um
            profissional.
          </p>
        </AnimateIn>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }, i) => (
            <AnimateIn key={title} delay={i * 120}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
