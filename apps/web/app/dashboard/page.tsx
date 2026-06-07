"use client";

import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Bem-vindo, {user?.name ?? "…"}
      </h1>
      <p className="text-muted-foreground">
        Seu workspace está pronto. As obras estarão disponíveis em breve.
      </p>
    </div>
  );
}
