import { AnimateIn } from "./animate-in";

const steps = [
  {
    number: "01",
    title: "Escolha seu ofício",
    description:
      "Eletricista, pedreiro, encanador, pintor — selecione e os serviços mais comuns já aparecem com preços de mercado.",
  },
  {
    number: "02",
    title: "Monte o orçamento",
    description:
      "Marque o que vai fazer, ajuste as quantidades. O total atualiza em tempo real, sem cálculo manual.",
  },
  {
    number: "03",
    title: "Baixe o PDF",
    description:
      "Documento profissional com sua logo e CNPJ, pronto para mandar pelo WhatsApp ou email.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/40 py-20" id="como-funciona">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            De 0 a PDF em menos de 3 minutos
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
