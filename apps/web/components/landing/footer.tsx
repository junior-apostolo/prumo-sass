import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2026 PRUMO. Todos os direitos reservados.
          </p>

          <nav className="flex items-center gap-6">
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

          <nav className="flex items-center gap-6">
            <Link
              href="/privacidade"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Termos
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
