import { AnimateIn } from "./animate-in";

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description:
      "Cadastro em 30 segundos. Seu workspace já vem configurado — nenhum dado de cartão necessário no plano gratuito.",
  },
  {
    number: "02",
    title: "Cadastre sua obra",
    description:
      "Nome, cliente, valor do contrato e data de início. Pronto. A obra aparece na sua lista com resumo financeiro em tempo real.",
  },
  {
    number: "03",
    title: "Gere o orçamento",
    description:
      "Adicione itens por categoria, veja o total atualizar em tempo real e exporte o PDF profissional em um clique.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/40 py-20" id="como-funciona">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Comece em 3 passos
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sem treinamento, sem onboarding. Apenas entre e comece a trabalhar.
          </p>
        </AnimateIn>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map(({ number, title, description }, i) => (
            <AnimateIn key={number} delay={i * 150} className="flex flex-col gap-3">
              <span className="text-5xl font-bold text-primary/20">{number}</span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
