import { AnimateIn } from "./animate-in";

const steps = [
  {
    number: "01",
    title: "Escolha seu ofício",
    description: "Eletricista, pedreiro, pintor… os preços de referência já entram prontos.",
  },
  {
    number: "02",
    title: "Monte o orçamento",
    description: "Adicione itens, ajuste valores. As contas e a formatação são automáticas.",
  },
  {
    number: "03",
    title: "Baixe o PDF",
    description: "Documento profissional com a sua logo, pronto para mandar pro cliente.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1080px] mt-[104px] px-8" id="como">
      <AnimateIn className="text-center">
        <h2 className="font-newsreader font-medium text-[42px] leading-[1.1] tracking-[-0.02em]">
          De 0 a PDF em menos de 3 minutos
        </h2>
        <p className="mt-3 text-[#5A6781]">
          Sem treinamento, sem onboarding. Apenas entre e comece a trabalhar.
        </p>
      </AnimateIn>
      <div className="grid md:grid-cols-3 gap-5 mt-[46px]">
        {steps.map(({ number, title, description }, i) => (
          <AnimateIn key={number} delay={i * 150} className="text-left">
            <div className="flex items-center gap-3">
              <span className="font-newsreader text-[34px] font-medium text-[#1E5BE6]">
                {number}
              </span>
              <span className="h-px flex-1 bg-[#E1E8F5]" />
            </div>
            <h3 className="text-[20px] font-bold mt-4 tracking-[-0.01em]">{title}</h3>
            <p className="text-[15px] leading-[1.6] text-[#5A6781] mt-2">{description}</p>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
