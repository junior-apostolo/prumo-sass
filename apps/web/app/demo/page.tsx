import Link from "next/link";
import { DemoWizard } from "@/components/demo/wizard";

export const metadata = {
  title: "Gerar orçamento grátis — PRUMO",
  description:
    "Crie um orçamento profissional em menos de 3 minutos. Sem cadastro, sem cartão.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-wider text-primary">
            PRUMO
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">
              Já tem conta?
            </span>
            <Link
              href="/login"
              className="font-medium hover:text-primary transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 font-medium hover:bg-primary/90 transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-primary/5 border-b py-6 px-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Gere seu orçamento profissional agora
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sem cadastro · Sem cartão · PDF pronto em menos de 3 minutos
        </p>
      </div>

      {/* Wizard */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        <DemoWizard />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <p>
          PRUMO · Gestão de obras para profissionais da construção civil ·{" "}
          <Link href="/register" className="hover:text-foreground underline">
            Criar conta grátis
          </Link>
        </p>
      </footer>
    </div>
  );
}
