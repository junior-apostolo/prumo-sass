"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, Settings, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function PrumoIcon() {
  return (
    <svg width="17" height="20" viewBox="0 0 22 26" fill="none" aria-hidden="true">
      <line x1="11" y1="0" x2="11" y2="9" stroke="#1E5BE6" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 8 L4.5 10 L11 25 L17.5 10 Z" fill="#1E5BE6" />
      <circle cx="11" cy="13" r="1.6" fill="#fff" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/dashboard/orcamentos/rapido", label: "Orçamento Rápido", icon: FileText },
  { href: "/dashboard/obras", label: "Obras", icon: Building2 },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-2.5 px-3.5 py-[10px] min-h-11 rounded-xl text-[14px] transition-colors no-underline ${
              active
                ? "bg-[#EEF3FF] text-[#1E5BE6] font-semibold"
                : "text-[#6B7891] font-medium hover:bg-[#F7FAFF] hover:text-[#0B1220]"
            }`}
          >
            <Icon className="size-[18px] shrink-0" strokeWidth={2} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ name, onLogout }: { name?: string; onLogout: () => void }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex items-center gap-2.5 border-t border-[#EEF2F9] pt-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF3FF] text-[#1E5BE6] text-[13px] font-semibold">
        {initial}
      </div>
      <span className="flex-1 truncate text-[13.5px] font-medium text-[#334155]">{name}</span>
      <button
        type="button"
        onClick={onLogout}
        aria-label="Sair"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#9AA7BD] hover:bg-[#F7FAFF] hover:text-[#C8434F] transition-colors"
      >
        <LogOut className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse">
          <PrumoIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-20 w-[248px] flex-col border-r border-[#EEF2F9] bg-white px-4 py-6">
        <Link href="/dashboard/orcamentos/rapido" className="flex items-center gap-2 px-2 pb-6 no-underline">
          <PrumoIcon />
          <span className="font-newsreader text-[19px] font-semibold tracking-[-0.01em] text-[#0B1220]">
            PRUMO
          </span>
        </Link>
        <NavList pathname={pathname} />
        <div className="mt-auto">
          <UserFooter name={user?.name} onLogout={logout} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#EEF2F9] bg-white/90 backdrop-blur px-4">
        <Link href="/dashboard/orcamentos/rapido" className="flex items-center gap-2 no-underline">
          <PrumoIcon />
          <span className="font-newsreader text-[17px] font-semibold tracking-[-0.01em] text-[#0B1220]">
            PRUMO
          </span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="ml-auto min-h-11 min-w-11 rounded-full" />}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 flex flex-col">
            <SheetHeader>
              <SheetTitle className="text-left font-newsreader text-[19px] font-semibold text-[#0B1220]">
                PRUMO
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-1 flex-col px-1">
              <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
              <div className="mt-auto pt-4">
                <UserFooter name={user?.name} onLogout={logout} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main content */}
      <main className="lg:pl-[248px]">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </main>
    </div>
  );
}
