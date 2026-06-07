import { FileText, TrendingDown, MessagesSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimateIn } from "./animate-in";

const problems = [
  {
    icon: FileText,
    title: "Orçamentos que parecem amadores",
    description:
      "Clientes pedem desconto porque o documento no Word não inspira confiança. Você perde para o concorrente que entrega um PDF bem formatado.",
  },
  {
    icon: TrendingDown,
    title: "Custo real? Só quando a obra termina",
    description:
      "Sem visibilidade do gasto em tempo real, você descobre o prejuízo só no final, quando não dá mais pra ajustar.",
  },
  {
    icon: MessagesSquare,
    title: "Dados em planilha, WhatsApp e caderninho",
    description:
      "Uma hora procurando onde anotou aquele gasto. Informação espalhada, decisão errada.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-muted/40 py-20" id="problema">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Você ainda gerencia obras assim?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Se algum desses cenários soa familiar, o PRUMO foi feito pra você.
          </p>
        </AnimateIn>

        <div className="grid gap-6 md:grid-cols-3">
          {problems.map(({ icon: Icon, title, description }, i) => (
            <AnimateIn key={title} delay={i * 120}>
              <Card className="border-destructive/20 bg-destructive/5 h-full">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <Icon className="size-5 text-destructive" />
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
