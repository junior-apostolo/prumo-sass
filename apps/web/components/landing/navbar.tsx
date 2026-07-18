import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function PrumoIcon() {
  return (
    <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
      <line x1="11" y1="0" x2="11" y2="9" stroke="#1E5BE6" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 8 L4.5 10 L11 25 L17.5 10 Z" fill="#1E5BE6" />
      <circle cx="11" cy="13" r="1.6" fill="#fff" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const navLinks = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como", label: "Como funciona" },
  { href: "#precos", label: "Preços" },
];

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
        {navLinks.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="text-[15px] font-medium text-[#475569] hover:text-foreground transition-colors no-underline"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-3.5">
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

      <Sheet>
        <SheetTrigger
          render={
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-[#1E3A8A]"
              aria-label="Abrir menu"
            />
          }
        >
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="right" className="w-4/5 px-6 py-6 flex flex-col">
          <SheetHeader className="p-0">
            <SheetTitle className="flex items-center gap-2 font-newsreader text-[20px]">
              <PrumoIcon />
              PRUMO
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col mt-6">
            {navLinks.map(({ href, label }) => (
              <SheetClose
                key={href}
                render={
                  <a
                    href={href}
                    className="text-[16px] font-medium text-[#475569] py-3 no-underline"
                  />
                }
              >
                {label}
              </SheetClose>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-[#EEF2F9]">
            <SheetClose
              render={
                <Link
                  href="/login"
                  className="text-[15px] font-semibold text-[#1E3A8A] text-center py-3 no-underline"
                />
              }
            >
              Entrar
            </SheetClose>
            <SheetClose
              render={
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#1E5BE6] text-white text-[15px] font-semibold px-5 py-[13px] rounded-full no-underline shadow-[0_8px_20px_rgba(30,91,230,0.28)] hover:bg-[#1a4ed4] transition-colors"
                />
              }
            >
              Gerar orçamento grátis
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
