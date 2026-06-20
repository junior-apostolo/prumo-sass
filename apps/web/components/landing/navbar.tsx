import Link from "next/link";

function PrumoIcon() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
      <line x1="11" y1="0" x2="11" y2="9" stroke="#1E5BE6" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 8 L4.5 10 L11 25 L17.5 10 Z" fill="#1E5BE6" />
      <circle cx="11" cy="13" r="1.6" fill="#fff" />
    </svg>
  );
}

export function Navbar() {
  return (
    <header className="relative z-10 mx-auto max-w-[1200px] px-8 py-[26px] flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <PrumoIcon />
        <span className="font-newsreader text-[24px] font-semibold tracking-[-0.01em]">
          PRUMO
        </span>
      </div>

      <nav className="hidden md:flex items-center gap-[34px]">
        <a href="#recursos" className="text-[15px] font-medium text-[#475569] hover:text-foreground transition-colors no-underline">
          Recursos
        </a>
        <a href="#como" className="text-[15px] font-medium text-[#475569] hover:text-foreground transition-colors no-underline">
          Como funciona
        </a>
        <a href="#precos" className="text-[15px] font-medium text-[#475569] hover:text-foreground transition-colors no-underline">
          Preços
        </a>
      </nav>

      <div className="flex items-center gap-3.5">
        <Link
          href="/login"
          className="text-[15px] font-semibold text-[#1E3A8A] no-underline"
        >
          Entrar
        </Link>
        <Link
          href="/demo"
          className="inline-flex items-center gap-1.5 bg-[#1E5BE6] text-white text-[15px] font-semibold px-5 py-[11px] rounded-full no-underline shadow-[0_8px_20px_rgba(30,91,230,0.28)] hover:bg-[#1a4ed4] transition-colors"
        >
          Gerar orçamento grátis
        </Link>
      </div>
    </header>
  );
}
