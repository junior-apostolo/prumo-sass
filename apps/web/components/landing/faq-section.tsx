import { AnimateIn } from "./animate-in";

const faqs = [
  {
    question: "Preciso instalar alguma coisa?",
    answer:
      "Não. É tudo no navegador e funciona no celular — dá pra montar um orçamento ali na obra, no 3G.",
    open: true,
  },
  {
    question: "O PDF do plano gratuito tem marca d'água?",
    answer:
      "Não. No gratuito o PDF já é profissional e limpo. A sua logo no cabeçalho entra no plano Pro.",
    open: false,
  },
  {
    question: "Como funcionam os preços de mercado?",
    answer:
      "Já vêm valores de referência por ofício. Você usa como ponto de partida e ajusta para a sua região e a sua margem.",
    open: false,
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim, sem fidelidade. O Pro é mês a mês — cancela quando quiser.",
    open: false,
  },
  {
    question: "Serve pra qual tipo de profissional?",
    answer:
      "Autônomos da construção: eletricista, pedreiro, pintor, encanador, azulejista e gesseiro que trabalham sozinhos ou com um ajudante.",
    open: false,
  },
];

export function FaqSection() {
  return (
    <section className="mx-auto max-w-[760px] mt-[104px] px-8" id="faq">
      <AnimateIn className="text-center">
        <h2 className="font-newsreader font-medium text-[38px] leading-[1.1] tracking-[-0.02em]">
          Perguntas frequentes
        </h2>
      </AnimateIn>
      <div className="mt-9 flex flex-col gap-3">
        {faqs.map(({ question, answer, open }, i) => (
          <AnimateIn key={question} delay={i * 80}>
            <details
              className="bg-[#FBFCFE] border border-[#ECF0F8] rounded-[14px] px-[22px] py-5"
              {...(open ? { open: true } : {})}
            >
              <summary className="text-[16.5px] font-bold cursor-pointer list-none">
                {question}
              </summary>
              <p className="text-[15px] leading-[1.6] text-[#5A6781] mt-2.5">{answer}</p>
            </details>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
