import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroHeadline } from "./hero-headline";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-32">
      <div
        className="animate-fade-up"
        style={{ animationDelay: "0ms", opacity: 0 }}
      >
        <Badge variant="secondary" className="mb-6">
          Para prestadores de serviço autônomos
        </Badge>
      </div>

      <HeroHeadline />

      <p
        className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
        style={{ animationDelay: "180ms", opacity: 0 }}
      >
        Eletricista, pedreiro, pintor, encanador — gere PDFs profissionais com
        sua logo em minutos. Sem planilha, sem Word, sem designer.
      </p>

      <div
        className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        style={{ animationDelay: "280ms", opacity: 0 }}
      >
        <Link
          href="/demo"
          className={cn(buttonVariants({ size: "lg" }), "px-8")}
        >
          Gerar orçamento grátis
        </Link>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "px-8"
          )}
        >
          Criar conta
        </Link>
      </div>

      <p
        className="animate-fade-in mt-4 text-sm text-muted-foreground"
        style={{ animationDelay: "420ms", opacity: 0 }}
      >
        Sem cadastro · Sem cartão · PDF pronto em menos de 3 minutos
      </p>
    </section>
  );
}
