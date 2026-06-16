import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const DEMO_USADO_COOKIE = "prumo_demo_usado";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_URL}/demo/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Erro ao gerar PDF" }));
    return NextResponse.json(data, { status: res.status });
  }

  const pdfBuffer = await res.arrayBuffer();

  const response = new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="orcamento-prumo.pdf"',
    },
  });

  // Use response.cookies.set — cookies() from next/headers não propaga para NextResponse customizado
  response.cookies.set(DEMO_USADO_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
