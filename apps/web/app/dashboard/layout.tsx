"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b flex items-center px-6 gap-4">
        <span className="font-bold text-lg tracking-tight">PRUMO</span>
        <Separator orientation="vertical" className="h-5" />
        <nav className="flex-1 flex items-center gap-1 text-sm text-muted-foreground">
          {/* Nav links adicionados nas próximas milestones */}
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
