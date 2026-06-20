import Link from "next/link";

function ArrowRight({ size = 17, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="#1E5BE6" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HomeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 10l9-7 9 7v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>;
}
function FileIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M7 4h10l3 4v12a1 1 0 01-1 1H5a1 1 0 01-1-1V8z" stroke="#9AA7BD" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}
function ChartIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19l5-5 4 3 7-8" stroke="#9AA7BD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SettingsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.5" stroke="#9AA7BD" strokeWidth="1.8" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="#9AA7BD" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-[10px] rounded-[9px] mb-1 text-[13.5px] ${
        active ? "bg-[#EEF3FF] text-[#1E5BE6] font-semibold" : "text-[#6B7891] font-medium"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="border border-[#EEF2F9] rounded-[12px] p-3.5">
      <div className="text-[12px] text-[#8593AB] font-medium">{label}</div>
      <div
        className="font-newsreader text-[22px] font-semibold mt-1"
        style={{ color: valueColor ?? "#0B1220" }}
      >
        {value}
      </div>
    </div>
  );
}

function TableRow({
  obra,
  cliente,
  status,
  statusColor,
  statusBg,
}: {
  obra: string;
  cliente: string;
  status: string;
  statusColor: string;
  statusBg: string;
}) {
  return (
    <div
      className="grid text-[13.5px] items-center px-4 py-[13px] border-t border-[#F2F5FB]"
      style={{ gridTemplateColumns: "1.6fr 1fr 0.9fr" }}
    >
      <span className="font-semibold">{obra}</span>
      <span className="text-[#6B7891]">{cliente}</span>
      <span>
        <em
          className="not-italic text-[12px] font-semibold px-[9px] py-[3px] rounded-[6px]"
          style={{ color: statusColor, background: statusBg }}
        >
          {status}
        </em>
      </span>
    </div>
  );
}

function AppMockup() {
  return (
    <div className="bg-white border border-[#E6ECF7] rounded-[18px] shadow-[0_30px_80px_rgba(20,50,120,0.16)] overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-[7px] px-[18px] py-[14px] border-b border-[#EEF2F9] bg-[#FBFCFE]">
        <span className="w-[11px] h-[11px] rounded-full bg-[#F1606A]" />
        <span className="w-[11px] h-[11px] rounded-full bg-[#F5BD4F]" />
        <span className="w-[11px] h-[11px] rounded-full bg-[#52C26B]" />
        <span className="ml-3.5 text-[12.5px] text-[#9AA7BD]">app.prumo.com.br/obras</span>
      </div>
      {/* App layout */}
      <div className="grid" style={{ gridTemplateColumns: "210px 1fr" }}>
        {/* Sidebar */}
        <aside className="border-r border-[#EEF2F9] p-[18px] px-[14px] bg-[#FBFCFE]">
          <div className="flex items-center gap-2 font-newsreader font-semibold text-[17px] px-2 pb-[14px]">
            <svg width="15" height="18" viewBox="0 0 22 26" fill="none">
              <line x1="11" y1="0" x2="11" y2="9" stroke="#1E5BE6" strokeWidth="2" strokeLinecap="round" />
              <path d="M11 8 L4.5 10 L11 25 L17.5 10 Z" fill="#1E5BE6" />
            </svg>
            PRUMO
          </div>
          <NavItem icon={<HomeIcon />} label="Obras" active />
          <NavItem icon={<FileIcon />} label="Orçamentos" />
          <NavItem icon={<ChartIcon />} label="Financeiro" />
          <NavItem icon={<SettingsIcon />} label="Configurações" />
        </aside>
        {/* Main content */}
        <main className="p-[22px] px-[24px] bg-white">
          <div className="flex items-center justify-between mb-[18px]">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[#9AA7BD]">Resumo</div>
              <div className="font-newsreader text-[21px] font-semibold mt-0.5">Minhas obras</div>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-[#1E5BE6] text-white text-[12.5px] font-semibold px-3.5 py-2 rounded-lg">
              + Nova obra
            </span>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatCard label="Orçado" value="R$ 42.800" />
            <StatCard label="Realizado" value="R$ 31.150" valueColor="#1E5BE6" />
            <StatCard label="Margem" value="27%" valueColor="#22B07D" />
          </div>
          {/* Table */}
          <div className="border border-[#EEF2F9] rounded-[12px] overflow-hidden">
            <div
              className="grid text-[11.5px] font-semibold text-[#9AA7BD] uppercase tracking-[0.04em] px-4 py-[11px] bg-[#FBFCFE]"
              style={{ gridTemplateColumns: "1.6fr 1fr 0.9fr" }}
            >
              <span>Obra</span>
              <span>Cliente</span>
              <span>Status</span>
            </div>
            <TableRow
              obra="Reforma elétrica — Apto 32"
              cliente="Carla M."
              status="Em obra"
              statusColor="#1F9D63"
              statusBg="#E8F7EF"
            />
            <TableRow
              obra="Pintura fachada — Loja Centro"
              cliente="João P."
              status="Orçamento"
              statusColor="#1E5BE6"
              statusBg="#EEF3FF"
            />
            <TableRow
              obra="Troca de fiação — Casa Vila Nova"
              cliente="Anderson L."
              status="Concluída"
              statusColor="#6B7891"
              statusBg="#F1F4F9"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <div className="relative">
      {/* Gradient blobs */}
      <div
        aria-hidden="true"
        className="absolute top-[-180px] left-[-220px] w-[620px] h-[620px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 35% 35%,#BBD2FF,#E7F0FF 60%,rgba(231,240,255,0) 72%)",
          filter: "blur(8px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-[-120px] right-[-240px] w-[560px] h-[560px] rounded-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(circle at 60% 40%,#A9C6FF,#E7F0FF 58%,rgba(231,240,255,0) 72%)",
          filter: "blur(8px)",
        }}
      />

      {/* Hero text section */}
      <section className="relative z-10 mx-auto max-w-[920px] px-8 pt-14 pb-0 text-center">
        {/* Badge */}
        <div
          className="animate-fade-up inline-flex items-center gap-2 bg-white border border-[#DCE6FA] rounded-full px-4 py-[7px] text-[13.5px] font-semibold text-[#2B4B8F] shadow-[0_4px_14px_rgba(30,91,230,0.08)]"
          style={{ animationDelay: "0ms", opacity: 0 }}
        >
          <span className="w-[7px] h-[7px] rounded-full bg-[#22B07D] inline-block flex-none" />
          Para prestadores de serviço autônomos
        </div>

        {/* H1 */}
        <h1
          className="animate-fade-up font-newsreader font-medium leading-[1.06] tracking-[-0.02em] mt-6 text-[#0B1220]"
          style={{ fontSize: "clamp(36px, 5vw, 62px)", animationDelay: "50ms", opacity: 0 }}
        >
          Seu primeiro orçamento profissional
          <br />
          em{" "}
          <em className="not-italic text-[#1E5BE6]">menos de 3 minutos</em>
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-up mx-auto mt-6 max-w-[620px] text-[18.5px] leading-[1.55] text-[#4A5568]"
          style={{ animationDelay: "120ms", opacity: 0 }}
        >
          Eletricista, pedreiro, pintor, encanador — gere PDFs profissionais com a sua logo em
          minutos. Sem planilha, sem Word, sem designer.
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-up flex gap-3.5 justify-center mt-[34px] flex-wrap"
          style={{ animationDelay: "180ms", opacity: 0 }}
        >
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-[#1E5BE6] text-white text-[16px] font-semibold px-7 py-[15px] rounded-full no-underline shadow-[0_12px_28px_rgba(30,91,230,0.30)] hover:bg-[#1a4ed4] transition-colors"
          >
            Gerar orçamento grátis
            <ArrowRight />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center bg-white text-[#1E3A8A] text-[16px] font-semibold px-[26px] py-[15px] rounded-full no-underline border border-[#D7E1F4] hover:bg-[#F5F8FF] transition-colors"
          >
            Criar conta
          </Link>
        </div>

        {/* Social proof */}
        <div
          className="animate-fade-up flex gap-2.5 justify-center items-center flex-wrap mt-5 text-[13.5px] text-[#7C8AA0]"
          style={{ animationDelay: "240ms", opacity: 0 }}
        >
          <span>Sem cadastro</span>
          <span className="text-[#C7D2E5]">·</span>
          <span>Sem cartão</span>
          <span className="text-[#C7D2E5]">·</span>
          <span>PDF pronto em menos de 3 minutos</span>
        </div>

        {/* Search bar mock */}
        <div
          className="animate-fade-up mx-auto mt-[38px] max-w-[560px] flex items-center gap-2 bg-white border border-[#E1E8F5] rounded-2xl px-2 py-2 pl-[18px] shadow-[0_18px_50px_rgba(20,50,120,0.12)]"
          style={{ animationDelay: "300ms", opacity: 0 }}
        >
          <div className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#1E3A8A] bg-[#EEF3FF] px-3.5 py-[9px] rounded-[10px] whitespace-nowrap">
            <span className="w-2 h-2 rounded-sm bg-[#1E5BE6] inline-block flex-none" />
            Eletricista
            <ChevronDown />
          </div>
          <span className="flex-1 text-left text-[15px] text-[#9AA7BD] px-1 truncate">
            Troca de fiação e 6 pontos de tomada…
          </span>
          <button
            type="button"
            className="w-[42px] h-[42px] rounded-[11px] bg-[#1E5BE6] inline-flex items-center justify-center shadow-[0_8px_18px_rgba(30,91,230,0.30)] flex-none border-none"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* App mockup */}
      <section
        className="relative z-10 mx-auto max-w-[1080px] mt-[54px] px-8 animate-fade-up"
        style={{ animationDelay: "360ms", opacity: 0 }}
      >
        <AppMockup />
      </section>
    </div>
  );
}
