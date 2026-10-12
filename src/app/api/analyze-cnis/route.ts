import { NextResponse } from "next/server";
import { analyzeCnisPdf } from "@/lib/cnis-analyzer";
import { safeErrorMessage } from "@/lib/cnis-privacy";
import { MAX_CNIS_BYTES, validateCnisUpload } from "@/lib/cnis-upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const value = formData.get("cnisDocument");
    if (!(value instanceof File)) {
      return NextResponse.json({ message: "O upload do documento CNIS é obrigatório." }, { status: 400 });
    }
    const bytes = Buffer.from(await value.arrayBuffer());
    const validationError = validateCnisUpload({ size: value.size, bytes });
    if (validationError) {
      const status = value.size > MAX_CNIS_BYTES ? 413 : 400;
      return NextResponse.json({ message: validationError }, { status });
    }

    const data = await analyzeCnisPdf(bytes);
    return NextResponse.json({ message: "Análise do CNIS concluída!", data });
  } catch (error) {
    console.error("[API CNIS] Falha operacional:", error instanceof Error ? error.name : "erro_desconhecido");
    const message = safeErrorMessage(error);
    const isDocumentError = /PDF|OCR|texto|legível|extração|arquivo/i.test(message);
    const isTimeout = /tempo limite|timeout|excedido|abortar/i.test(message);
    return NextResponse.json({ message, retryable: !isDocumentError || isTimeout }, { status: isDocumentError && !isTimeout ? 422 : isTimeout ? 504 : 500 });
  }
}
