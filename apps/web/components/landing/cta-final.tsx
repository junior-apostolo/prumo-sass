import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimateIn } from "./animate-in";

export function CtaFinal() {
  return (
    <section className="py-20">
      <AnimateIn className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Pare de perder contratos por orçamentos mal formatados
        </h2>
        <p className="mt-4 text-muted-foreground">
          Junte-se a profissionais que já gerenciam obras com mais controle e
          profissionalismo.
        </p>
        <Link
          href="/register"
          className={cn(buttonVariants({ size: "lg" }), "mt-8 px-10")}
        >
          Criar conta grátis
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">
          Grátis para começar · Sem cartão de crédito
        </p>
      </AnimateIn>
    </section>
  );
}
