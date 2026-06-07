import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          PRUMO
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#funcionalidades"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Funcionalidades
          </Link>
          <Link
            href="#precos"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Preços
          </Link>
        </nav>

        <Link
          href="/register"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Começar grátis
        </Link>
      </div>
    </header>
  );
}
