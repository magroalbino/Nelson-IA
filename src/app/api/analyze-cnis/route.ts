import { NextResponse } from "next/server";
import { analyzeCnisPdf } from "@/lib/cnis-analyzer";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const value = formData.get("cnisDocument");
    if (!(value instanceof File)) {
      return NextResponse.json({ message: "O upload do documento CNIS é obrigatório." }, { status: 400 });
    }
    if (value.size === 0) {
      return NextResponse.json({ message: "O arquivo enviado está vazio." }, { status: 400 });
    }
    if (value.size > 25 * 1024 * 1024) {
      return NextResponse.json({ message: "O PDF deve ter no máximo 25 MB." }, { status: 413 });
    }

    const bytes = Buffer.from(await value.arrayBuffer());
    if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return NextResponse.json({ message: "O arquivo enviado não parece ser um PDF válido." }, { status: 400 });
    }

    const data = await analyzeCnisPdf(bytes);
    return NextResponse.json({ message: "Análise do CNIS concluída!", data });
  } catch (error) {
    console.error("[API CNIS] Erro:", error);
    const message = error instanceof Error ? error.message : "Falha ao analisar o CNIS.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
