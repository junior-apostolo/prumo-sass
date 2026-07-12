import Link from "next/link";
import { cookies } from "next/headers";
import { DemoWizard } from "@/components/demo/wizard";
import { DemoUsado } from "@/components/demo/demo-usado";
import { DEMO_USADO_COOKIE } from "@/app/api/demo/pdf/route";

export const metadata = {
  title: "Gerar orçamento grátis — PRUMO",
  description:
    "Crie um orçamento profissional em menos de 3 minutos. Sem cadastro, sem cartão.",
};

function PrumoIcon() {
  return (
    <svg width="17" height="20" viewBox="0 0 22 26" fill="none" aria-hidden="true">
      <line x1="11" y1="0" x2="11" y2="9" stroke="#1E5BE6" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 8 L4.5 10 L11 25 L17.5 10 Z" fill="#1E5BE6" />
      <circle cx="11" cy="13" r="1.6" fill="#fff" />
    </svg>
  );
}

export default async function DemoPage() {
  const cookieStore = await cookies();
  const demoUsado = cookieStore.get(DEMO_USADO_COOKIE)?.value === "true";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[#EEF2F9]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <PrumoIcon />
            <span className="font-newsreader text-[19px] font-semibold tracking-[-0.01em] text-[#0B1220]">
              PRUMO
            </span>
          </Link>
          <div className="flex items-center gap-3.5 text-[14px]">
            <span className="text-[#7C8AA0] hidden sm:inline">Já tem conta?</span>
            <Link
              href="/login"
              className="font-semibold text-[#1E3A8A] hover:text-[#1E5BE6] transition-colors no-underline"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#1E5BE6] text-white px-4 py-2 font-semibold hover:bg-[#1a4ed4] transition-colors no-underline shadow-[0_8px_18px_rgba(30,91,230,0.24)]"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-[#F7FAFF] border-b border-[#EEF2F9] py-9 px-4 text-center">
        <h1 className="font-newsreader text-[28px] sm:text-[32px] font-medium tracking-[-0.01em] text-[#0B1220]">
          {demoUsado ? "Obrigado por experimentar o PRUMO!" : "Gere seu orçamento profissional agora"}
        </h1>
        <p className="text-[#6B7891] mt-2 text-[14.5px]">
          {demoUsado
            ? "Crie sua conta e tenha acesso a orçamentos ilimitados."
            : "Sem cadastro · Sem cartão · PDF pronto em menos de 3 minutos"}
        </p>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        {demoUsado ? <DemoUsado /> : <DemoWizard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EEF2F9] py-6 text-center text-[12.5px] text-[#7C8AA0]">
        <p>
          PRUMO · Gestão de obras para profissionais da construção civil ·{" "}
          <Link href="/register" className="text-[#1E5BE6] hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </footer>
    </div>
  );
}
