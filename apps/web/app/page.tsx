export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Gestão de Obras</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Plataforma em construção — monorepo configurado com Next.js + Fastify + Prisma.
      </p>
      <div className="flex gap-3">
        <a
          href="/login"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Entrar
        </a>
        <a
          href="/register"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Criar conta
        </a>
      </div>
    </main>
  );
}
