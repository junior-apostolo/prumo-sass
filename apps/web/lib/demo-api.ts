import type { DemoWizardPayload } from "@enge-pro/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function gerarOrcamentoPdf(payload: DemoWizardPayload): Promise<Blob> {
  const res = await fetch(`${API_URL}/demo/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Erro ao gerar PDF" }));
    throw new Error(data.error ?? "Erro ao gerar PDF");
  }

  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
