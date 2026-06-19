"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/dashboard/obras", label: "Obras" },
  { href: "/dashboard/orcamentos/rapido", label: "Orçamento Rápido" },
  { href: "/dashboard/configuracoes", label: "Configurações" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b flex items-center px-4 sm:px-6 gap-4">
        <span className="font-bold text-lg tracking-tight">PRUMO</span>

        {/* Nav desktop */}
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        <nav className="flex-1 hidden sm:flex items-center gap-1 text-sm">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 min-h-11 flex items-center rounded-md transition-colors ${
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

        {/* Ações à direita */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={logout} className="hidden sm:flex">
            Sair
          </Button>

          {/* Menu mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="sm:hidden min-h-11 min-w-11" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">PRUMO</SheetTitle>
              </SheetHeader>
              {user?.name && (
                <p className="text-sm text-muted-foreground px-1 -mt-2 mb-4">{user.name}</p>
              )}
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const active = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-3 min-h-11 flex items-center rounded-md text-sm transition-colors ${
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
              <Separator className="my-4" />
              <Button variant="outline" className="w-full" onClick={() => { setOpen(false); logout(); }}>
                Sair
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
