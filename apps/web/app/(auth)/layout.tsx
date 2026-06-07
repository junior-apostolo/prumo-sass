export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold tracking-tight">PRUMO</span>
          <p className="text-sm text-muted-foreground mt-1">Gestão de obras profissional</p>
        </div>
        {children}
      </div>
    </div>
  );
}
