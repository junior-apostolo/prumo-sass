import { Building2, FileCheck, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimateIn } from "./animate-in";

const features = [
  {
    icon: FileCheck,
    title: "PDF com a sua logo",
    description:
      "Logo, CNPJ e dados da empresa no documento. O tipo de proposta que faz o cliente fechar — sem pedir desconto.",
  },
  {
    icon: Building2,
    title: "Preços de mercado prontos",
    description:
      "Selecione o ofício, os serviços já aparecem com valores de referência. Ajuste o que quiser e gere o PDF.",
  },
  {
    icon: BarChart3,
    title: "Obra no controle",
    description:
      "Registre gastos e veja quanto já foi para a obra em tempo real. Alerta quando chega nos 80% do contrato.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20" id="funcionalidades">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Tudo para você cobrar pelo que vale
          </h2>
          <p className="mt-3 text-muted-foreground">
            De autônomo que manda preço no WhatsApp para profissional que envia
            PDF com a sua logo.
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
