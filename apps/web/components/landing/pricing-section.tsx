import Link from "next/link";
import { AnimateIn } from "./animate-in";

const freePlan = {
  name: "Gratuito",
  price: "R$ 0",
  period: "/mês",
  cta: "Começar grátis",
  href: "/register",
  items: [
    "2 obras ativas",
    "5 orçamentos por mês",
    "PDF profissional (logo no Pro)",
    "Controle financeiro básico",
  ],
};

const proPlan = {
  name: "Pro",
  price: "R$ 89",
  period: "/mês",
  cta: "Quero o PDF com minha logo",
  href: "/register",
  items: [
    "Obras ilimitadas",
    "Orçamentos ilimitados",
    "PDF com logo e CNPJ da empresa",
    "Controle financeiro completo com gráficos",
    "Exportação CSV",
    "Suporte prioritário",
  ],
};

function CheckGreen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-none mt-[2px]">
      <path d="M5 13l4 4 10-11" stroke="#1F9D63" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CheckBlue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-none mt-[2px]">
      <path d="M5 13l4 4 10-11" stroke="#7FA8FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PricingSection() {
  return (
    <section className="mx-auto max-w-[1080px] mt-[104px] px-8" id="precos">
      <AnimateIn className="text-center max-w-[600px] mx-auto">
        <h2 className="font-newsreader font-medium text-[42px] leading-[1.1] tracking-[-0.02em]">
          Quanto vale fechar um serviço a mais por mês?
        </h2>
        <p className="text-[17.5px] leading-[1.55] text-[#5A6781] mt-4">
          O Pro se paga com o primeiro serviço que você fechar usando um PDF profissional.
        </p>
      </AnimateIn>

      <div className="grid md:grid-cols-2 gap-[22px] mt-[46px] max-w-[840px] mx-auto">
        {/* Free plan */}
        <AnimateIn>
          <div className="bg-white border border-[#E6ECF7] rounded-[20px] p-8">
            <div className="text-[15px] font-semibold text-[#3C4A63]">{freePlan.name}</div>
            <div className="flex items-baseline gap-1.5 mt-3">
              <span className="font-newsreader text-[44px] font-semibold">{freePlan.price}</span>
              <span className="text-[#8593AB] text-[15px]">{freePlan.period}</span>
            </div>
            <Link
              href={freePlan.href}
              className="block text-center mt-[22px] bg-white border border-[#D7E1F4] text-[#1E3A8A] text-[15px] font-semibold py-[13px] rounded-[11px] no-underline hover:bg-[#F5F8FF] transition-colors"
            >
              {freePlan.cta}
            </Link>
            <ul className="mt-6 flex flex-col gap-[13px] text-[14.5px] text-[#3C4A63]">
              {freePlan.items.map((item) => (
                <li key={item} className="flex gap-2.5 items-start">
                  <CheckGreen />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </AnimateIn>

        {/* Pro plan */}
        <AnimateIn delay={150}>
          <div className="bg-[#0B1B3A] rounded-[20px] p-8 relative shadow-[0_30px_70px_rgba(11,27,58,0.30)]">
            <span className="absolute top-6 right-6 bg-[#1E5BE6] text-white text-[11.5px] font-bold px-3 py-[5px] rounded-full tracking-[0.03em]">
              RECOMENDADO
            </span>
            <div className="text-[15px] font-semibold text-[#9FB6E6]">{proPlan.name}</div>
            <div className="flex items-baseline gap-1.5 mt-3">
              <span className="font-newsreader text-[44px] font-semibold text-white">
                {proPlan.price}
              </span>
              <span className="text-[#8FA2C6] text-[15px]">{proPlan.period}</span>
            </div>
            <Link
              href={proPlan.href}
              className="block text-center mt-[22px] bg-[#1E5BE6] text-white text-[15px] font-semibold py-[13px] rounded-[11px] no-underline shadow-[0_12px_26px_rgba(30,91,230,0.40)] hover:bg-[#1a4ed4] transition-colors"
            >
              {proPlan.cta}
            </Link>
            <ul className="mt-6 flex flex-col gap-[13px] text-[14.5px] text-[#DCE6FA]">
              {proPlan.items.map((item) => (
                <li key={item} className="flex gap-2.5 items-start">
                  <CheckBlue />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
