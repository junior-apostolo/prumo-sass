import Link from "next/link";

function PrumoLogoLight() {
  return (
    <svg width="20" height="24" viewBox="0 0 22 26" fill="none">
      <line x1="11" y1="0" x2="11" y2="9" stroke="#7FA8FF" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 8 L4.5 10 L11 25 L17.5 10 Z" fill="#7FA8FF" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0A1430] py-[46px] px-8 border-t border-white/[0.08]">
      <div className="mx-auto max-w-[1080px] flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-2.5">
          <PrumoLogoLight />
          <span className="font-newsreader text-[20px] font-semibold text-white">PRUMO</span>
        </div>

        <nav className="flex gap-7 text-[14px]">
          <a href="#recursos" className="text-[#8FA2C6] no-underline hover:text-white transition-colors">
            Recursos
          </a>
          <a href="#precos" className="text-[#8FA2C6] no-underline hover:text-white transition-colors">
            Preços
          </a>
          <Link href="/demo" className="text-[#8FA2C6] no-underline hover:text-white transition-colors">
            Demo
          </Link>
          <Link href="/register" className="text-[#8FA2C6] no-underline hover:text-white transition-colors">
            Criar conta
          </Link>
        </nav>

        <div className="text-[13px] text-[#6B7891]">
          © 2026 PRUMO · Orçamento profissional que fecha serviço
        </div>
      </div>
    </footer>
  );
}
