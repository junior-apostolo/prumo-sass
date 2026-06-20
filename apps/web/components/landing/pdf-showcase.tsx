import { AnimateIn } from "./animate-in";

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M5 13l4 4 10-11" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PdfTableRow({ desc, qty, total }: { desc: string; qty: string; total: string }) {
  return (
    <tr className="border-t border-[#EEF2F9]">
      <td className="py-2">{desc}</td>
      <td className="text-center">{qty}</td>
      <td className="text-right font-semibold">{total}</td>
    </tr>
  );
}

export function PdfShowcase() {
  return (
    <section className="bg-[#0B1B3A] mt-[104px] py-[90px] px-8 relative overflow-hidden">
      {/* Background orb */}
      <div
        aria-hidden="true"
        className="absolute top-[-120px] right-[-120px] w-[420px] h-[420px] rounded-full opacity-50 pointer-events-none"
        style={{ background: "radial-gradient(circle,#1E5BE6,rgba(30,91,230,0) 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-[1080px] grid md:grid-cols-2 gap-14 items-center">
        {/* Left: copy */}
        <AnimateIn>
          <div className="text-[13px] font-semibold tracking-[0.06em] uppercase text-[#7FA8FF]">
            O documento que fecha serviço
          </div>
          <h2 className="font-newsreader font-medium text-[40px] leading-[1.12] tracking-[-0.02em] text-white mt-3.5">
            Manda um PDF que parece de empresa grande
          </h2>
          <p className="text-[17px] leading-[1.6] text-[#AEBDD9] mt-[18px] max-w-[440px]">
            Logo, CNPJ, itens organizados e total destacado. O cliente recebe um documento formal —
            e pensa duas vezes antes de pedir desconto.
          </p>
          <ul className="mt-[26px] flex flex-col gap-3.5">
            {[
              "Seu logo e CNPJ no cabeçalho",
              "Itens, quantidades e totais calculados",
              "Validade e condições de pagamento",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-[#DCE6FA] text-[15.5px]">
                <span className="w-[22px] h-[22px] rounded-full bg-[#1E5BE6] inline-flex items-center justify-center flex-none">
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </AnimateIn>

        {/* Right: floating PDF card */}
        <AnimateIn delay={150}>
          <div className="relative">
            <div className="bg-white rounded-[10px] shadow-[0_40px_90px_rgba(0,0,0,0.45)] px-8 py-[34px] max-w-[430px] mx-auto animate-prm-float">
              {/* PDF Header */}
              <div className="flex justify-between items-start border-b-2 border-[#0B1B3A] pb-4">
                <div className="flex items-center gap-2.5">
                  <svg width="20" height="24" viewBox="0 0 22 26" fill="none">
                    <line x1="11" y1="0" x2="11" y2="9" stroke="#1E5BE6" strokeWidth="2" strokeLinecap="round" />
                    <path d="M11 8 L4.5 10 L11 25 L17.5 10 Z" fill="#1E5BE6" />
                  </svg>
                  <div>
                    <div className="font-newsreader font-semibold text-[16px] text-[#0B1B3A]">
                      João Silva Elétrica ME
                    </div>
                    <div className="text-[10.5px] text-[#8593AB]">
                      CNPJ 12.345.678/0001-90 · (11) 98888-7777
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#9AA7BD] uppercase tracking-[0.05em]">Orçamento</div>
                  <div className="font-newsreader font-semibold text-[18px] text-[#0B1B3A]">Nº 0042</div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-[#6B7891] mt-3">
                <span>
                  Cliente: <strong className="text-[#0B1B3A]">Carla Mendes</strong>
                </span>
                <span>19/06/2026</span>
              </div>

              <table className="w-full border-collapse mt-4 text-[11.5px]">
                <thead>
                  <tr className="text-[#9AA7BD] text-left text-[9.5px] uppercase tracking-[0.04em]">
                    <th className="py-1.5 font-semibold">Descrição</th>
                    <th className="py-1.5 font-semibold text-center">Qtd</th>
                    <th className="py-1.5 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-[#3C4A63]">
                  <PdfTableRow desc="Troca de fiação 2,5mm²" qty="1" total="R$ 1.250" />
                  <PdfTableRow desc="Pontos de tomada" qty="6" total="R$ 780" />
                  <PdfTableRow desc="Quadro de distribuição" qty="1" total="R$ 950" />
                  <PdfTableRow desc="Mão de obra" qty="—" total="R$ 500" />
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-3.5 pt-3.5 border-t-2 border-[#0B1B3A]">
                <span className="text-[12px] text-[#6B7891] font-semibold">Total</span>
                <span className="font-newsreader font-semibold text-[24px] text-[#1E5BE6]">
                  R$ 3.480,00
                </span>
              </div>
              <div className="text-[9.5px] text-[#9AA7BD] mt-3">
                Validade: 15 dias · Pagamento: 50% início, 50% entrega
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
