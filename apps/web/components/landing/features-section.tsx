import { AnimateIn } from "./animate-in";

function PdfFileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v5h5" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function PackageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 7l9-4 9 4-9 4-9-4zM3 7v6l9 4 9-4V7" stroke="#1F9D63" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ChartLineIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 19V5M4 19l5-5 4 3 7-8" stroke="#1E5BE6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-[1080px] mt-[104px] px-8" id="recursos">
      <AnimateIn className="text-center max-w-[660px] mx-auto">
        <div className="text-[13px] font-semibold tracking-[0.06em] uppercase text-[#1E5BE6]">
          Recursos
        </div>
        <h2 className="font-newsreader font-medium text-[42px] leading-[1.1] tracking-[-0.02em] mt-3">
          Tudo para você cobrar pelo que vale
        </h2>
        <p className="text-[17.5px] leading-[1.55] text-[#5A6781] mt-4">
          De autônomo que manda preço no WhatsApp para profissional que envia PDF com a sua logo.
        </p>
      </AnimateIn>

      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr] mt-[46px] gap-5">
        {/* Large featured card */}
        <AnimateIn
          className="rounded-[20px] p-8 flex flex-col justify-between border border-[#DCE6FA]"
          style={{ background: "linear-gradient(160deg,#F4F8FF,#EAF1FF)" }}
        >
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1E5BE6] text-white text-[12.5px] font-semibold px-3 py-1.5 rounded-[8px]">
              <PdfFileIcon />
              PDF
            </div>
            <h3 className="font-newsreader text-[26px] font-semibold mt-[18px] tracking-[-0.01em]">
              PDF com a sua logo
            </h3>
            <p className="text-[15.5px] leading-[1.6] text-[#4A5568] mt-2.5 max-w-[420px]">
              Documento formal com o seu logo e CNPJ. Transmite confiança, reduz pechincha e fecha
              mais serviço.
            </p>
          </div>
          {/* PDF preview */}
          <div className="mt-[26px] bg-white border border-[#E2E9F6] rounded-[12px] p-4 shadow-[0_14px_36px_rgba(20,50,120,0.10)]">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0F3FA]">
              <div className="w-[34px] h-[34px] rounded-[8px] bg-[#EEF3FF] flex items-center justify-center font-newsreader font-semibold text-[#1E5BE6] text-[15px] flex-none">
                JS
              </div>
              <div>
                <div className="text-[13px] font-bold">João Silva Elétrica ME</div>
                <div className="text-[11.5px] text-[#9AA7BD]">CNPJ 12.345.678/0001-90</div>
              </div>
            </div>
            <div className="flex justify-between text-[13px] mt-[11px]">
              <span className="text-[#6B7891]">Orçamento nº 0042</span>
              <span className="font-bold">R$ 3.480,00</span>
            </div>
          </div>
        </AnimateIn>

        {/* Right column */}
        <div className="grid grid-rows-2 gap-5">
          <AnimateIn className="bg-[#FBFCFE] border border-[#ECF0F8] rounded-[20px] p-7" delay={100}>
            <div className="w-[44px] h-[44px] rounded-[11px] bg-[#EAF6F0] flex items-center justify-center">
              <PackageIcon />
            </div>
            <h3 className="text-[19px] font-bold mt-4 tracking-[-0.01em]">
              Preços de mercado prontos
            </h3>
            <p className="text-[14.5px] leading-[1.55] text-[#5A6781] mt-2">
              Valores por ofício já carregados. Comece de um ponto de partida — não do zero.
            </p>
          </AnimateIn>
          <AnimateIn className="bg-[#FBFCFE] border border-[#ECF0F8] rounded-[20px] p-7" delay={200}>
            <div className="w-[44px] h-[44px] rounded-[11px] bg-[#EEF3FF] flex items-center justify-center">
              <ChartLineIcon />
            </div>
            <h3 className="text-[19px] font-bold mt-4 tracking-[-0.01em]">Obra no controle</h3>
            <p className="text-[14.5px] leading-[1.55] text-[#5A6781] mt-2">
              Orçado vs. realizado em tempo real. Sem planilha e sem surpresa no fim da obra.
            </p>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
