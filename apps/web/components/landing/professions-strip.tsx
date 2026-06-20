export function ProfessionsStrip() {
  const professions = ["Eletricista", "Pedreiro", "Pintor", "Encanador", "Azulejista", "Gesseiro"];

  return (
    <section className="mx-auto max-w-[1080px] mt-16 px-8 text-center">
      <div className="text-[13px] font-semibold tracking-[0.04em] text-[#9AA7BD] uppercase">
        Feito para quem trabalha na obra
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-[18px]">
        {professions.map((p) => (
          <span
            key={p}
            className="px-[18px] py-[9px] border border-[#E6ECF7] rounded-full text-[14.5px] font-medium text-[#3C4A63]"
          >
            {p}
          </span>
        ))}
      </div>
    </section>
  );
}
