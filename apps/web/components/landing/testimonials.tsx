import { AnimateIn } from "./animate-in";

const testimonials = [
  {
    initials: "MR",
    name: "Marcos R.",
    role: "Eletricista · SP",
    quote: "Mandei o PDF com a minha logo e o cliente nem pediu desconto. Fechei na hora.",
    color: "#1E5BE6",
    bg: "#EEF3FF",
  },
  {
    initials: "JS",
    name: "Jucelino S.",
    role: "Pintor · MG",
    quote: "Antes eu perdia uma manhã montando orçamento no Word. Agora faço em cinco minutos.",
    color: "#1F9D63",
    bg: "#EAF6F0",
  },
  {
    initials: "AL",
    name: "Anderson L.",
    role: "Pedreiro · RJ",
    quote: "Pela primeira vez sei quanto sobra em cada obra antes dela terminar.",
    color: "#D89A2E",
    bg: "#FFF4E2",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-[1080px] mt-[104px] px-8">
      <AnimateIn className="text-center">
        <h2 className="font-newsreader font-medium text-[38px] leading-[1.1] tracking-[-0.02em]">
          Quem largou o Word não voltou
        </h2>
      </AnimateIn>
      <div className="grid md:grid-cols-3 gap-5 mt-[42px]">
        {testimonials.map(({ initials, name, role, quote, color, bg }, i) => (
          <AnimateIn key={name} delay={i * 120}>
            <figure className="bg-[#FBFCFE] border border-[#ECF0F8] rounded-[18px] p-[26px] m-0 h-full">
              <div className="text-[#F5BD4F] text-[15px] tracking-[2px]">★★★★★</div>
              <blockquote className="font-newsreader text-[16px] leading-[1.6] text-[#2C3852] mt-3.5 mb-0">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-[11px] mt-5">
                <span
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-bold text-[14px] flex-none"
                  style={{ background: bg, color }}
                >
                  {initials}
                </span>
                <span className="text-[13.5px]">
                  <strong>{name}</strong>
                  <br />
                  <span className="text-[#8593AB]">{role}</span>
                </span>
              </figcaption>
            </figure>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}
