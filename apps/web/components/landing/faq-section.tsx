import { AnimateIn } from "./animate-in";

const faqs = [
  {
    question: "Preciso de cartão de crédito para criar conta?",
    answer:
      "Não. O plano gratuito não exige cartão. Você só paga se decidir assinar o Pro.",
  },
  {
    question: "O PDF realmente parece profissional?",
    answer:
      "Sim. O PDF inclui a logo da sua empresa (plano Pro), dados do cliente, tabela de itens organizada por categoria, subtotais e total geral — pronto para enviar direto para o cliente.",
  },
  {
    question: "Funciona no celular?",
    answer:
      "Funciona. O PRUMO é responsivo e pensado para uso na obra — de iPhone SE a desktop. Você consegue registrar um gasto ou consultar o resumo financeiro direto do canteiro.",
  },
  {
    question: "Como funciona o controle de gastos?",
    answer:
      "Você registra cada gasto na obra (material, mão de obra, equipamento). O sistema calcula automaticamente o quanto foi gasto vs. orçado e exibe um gráfico comparativo. Tem alerta visual quando os gastos passam de 80% do contrato.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. Sem fidelidade, sem multa. Se cancelar, a conta volta automaticamente para o plano gratuito.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-muted/40 py-20" id="faq">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Perguntas frequentes
          </h2>
        </AnimateIn>

        <div className="mx-auto max-w-2xl divide-y">
          {faqs.map(({ question, answer }, i) => (
            <AnimateIn key={question} delay={i * 80}>
              <details className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {question}
                  <span className="shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{answer}</p>
              </details>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
