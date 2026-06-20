import { AnimateIn } from "./animate-in";

function MessageIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 9h8M8 13h5M5 4h14a1 1 0 011 1v12l-4-3H5a1 1 0 01-1-1V5a1 1 0 011-1z" stroke="#E15A5A" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="#D89A2E" strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke="#D89A2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h10" stroke="#3D6FD6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const problems = [
  {
    iconBg: "#FDECEC",
    icon: <MessageIcon />,
    title: "Orçamentos que parecem amadores",
    description:
      "Preço solto no WhatsApp ou num Word mal formatado. O cliente pede desconto — ou fecha com quem mandou um PDF bem feito.",
  },
  {
    iconBg: "#FFF4E2",
    icon: <ClockIcon />,
    title: "Cada orçamento toma uma hora",
    description:
      "Você monta tudo do zero toda vez: valores, contas, formatação. Falta um ponto de partida pronto.",
  },
  {
    iconBg: "#EEF3FF",
    icon: <ListIcon />,
    title: "Dados espalhados em todo lugar",
    description:
      "Planilha, WhatsApp e caderninho. Você só descobre o prejuízo quando a obra acaba.",
  },
];

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-[1080px] mt-[96px] px-8" id="problema">
      <AnimateIn className="text-center max-w-[620px] mx-auto">
        <h2 className="font-newsreader font-medium text-[42px] leading-[1.1] tracking-[-0.02em]">
          Você ainda gerencia obras assim?
        </h2>
      </AnimateIn>
      <div className="grid md:grid-cols-3 gap-5 mt-[42px]">
        {problems.map(({ iconBg, icon, title, description }, i) => (
          <AnimateIn key={title} delay={i * 120} className="bg-[#FBFCFE] border border-[#ECF0F8] rounded-[18px] p-7">
            <div
              className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center"
              style={{ background: iconBg }}
            >
              {icon}
            </div>
            <h3 className="text-[19px] font-bold mt-[18px] tracking-[-0.01em]">{title}</h3>
            <p className="text-[15px] leading-[1.6] text-[#5A6781] mt-2.5">{description}</p>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
