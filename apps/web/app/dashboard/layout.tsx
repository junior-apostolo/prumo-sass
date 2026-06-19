"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV_LINKS = [
  { href: "/dashboard/obras", label: "Obras" },
  { href: "/dashboard/orcamentos/rapido", label: "Orçamento Rápido" },
  { href: "/dashboard/configuracoes", label: "Configurações" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b flex items-center px-6 gap-4">
        <span className="font-bold text-lg tracking-tight">PRUMO</span>
        <Separator orientation="vertical" className="h-5" />
        <nav className="flex-1 flex items-center gap-1 text-sm">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
