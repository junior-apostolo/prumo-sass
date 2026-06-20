import Link from "next/link";

function ArrowRight() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CtaFinal() {
  return (
    <section
      className="relative mt-[104px] py-[110px] px-8 overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0B1B3A,#0A1430)" }}
    >
      {/* Watermark */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-newsreader font-semibold whitespace-nowrap pointer-events-none z-0 select-none"
        style={{
          fontSize: "clamp(120px, 22vw, 300px)",
          letterSpacing: "-0.03em",
          color: "rgba(126,168,255,0.07)",
        }}
      >
        PRUMO
      </div>

      <div className="relative z-10 max-w-[680px] mx-auto text-center">
        <h2 className="font-newsreader font-medium text-[44px] leading-[1.12] tracking-[-0.02em] text-white">
          Pare de perder contratos por orçamentos mal formatados
        </h2>
        <p className="text-[18px] leading-[1.55] text-[#AEBDD9] mt-[18px] max-w-[540px] mx-auto">
          Gere seu primeiro PDF agora — sem cadastro, sem cartão. Se gostar, crie sua conta e tenha
          tudo ilimitado.
        </p>
        <div className="flex gap-3.5 justify-center mt-8 flex-wrap">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#1E5BE6] text-white text-[16px] font-semibold px-[30px] py-4 rounded-full no-underline shadow-[0_14px_32px_rgba(30,91,230,0.45)] hover:bg-[#1a4ed4] transition-colors"
          >
            Criar conta grátis
            <ArrowRight />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-white text-[16px] font-semibold px-7 py-4 rounded-full no-underline border hover:bg-white/10 transition-colors"
            style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.18)" }}
          >
            Gerar orçamento grátis
          </Link>
        </div>
      </div>
    </section>
  );
}
