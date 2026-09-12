"use server";

import { z } from "zod";
import { generateLegalPetition } from "@/ai/flows/generate-legal-petition";
import { analyzeCnisPdf } from "@/lib/cnis-analyzer";

// Schema for Legal Petition Generation
const petitionSchema = z.object({
  documentUri: z.string().min(1, "O upload do documento é obrigatório."),
  tipoPetição: z.enum(["administrativo", "judicial"], {
    errorMap: () => ({ message: "Selecione um tipo de petição válido." }),
  }),
});

interface PetitionState {
  errors?: {
    tipoPetição?: string[];
    documentUri?: string[];
  };
  message?: string | null;
  data?: {
    peticao: string;
    documentosAnexos: string;
  } | null;
}

export async function generatePetitionAction(
  prevState: PetitionState,
  formData: FormData
): Promise<PetitionState> {
  const validatedFields = petitionSchema.safeParse({
    documentUri: formData.get("documentUri"),
    tipoPetição: formData.get("tipoPetição"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Dados inválidos.",
    };
  }

  try {
    const result = await generateLegalPetition(validatedFields.data);
    return {
      message: "Petição gerada com sucesso!",
      data: result,
    };
  } catch (error: any) {
    console.error("[ACTION] Erro Petição:", error);
    return {
      message: error?.message || "Falha ao gerar a petição. Tente novamente.",
    };
  }
}

// Schema for CNIS Analysis
const cnisSchema = z.object({
    cnisDocument: z.instanceof(File, { message: 'O upload do documento CNIS é obrigatório.' }),
});

interface CnisState {
    errors?: { cnisDocument?: string[] };
    message?: string | null;
    data?: any | null;
}

export async function analyzeCnisAction(prevState: CnisState, formData: FormData): Promise<CnisState> {
    const validatedFields = cnisSchema.safeParse({
        cnisDocument: formData.get("cnisDocument"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Dados inválidos.',
        };
    }

    try {
        const file = validatedFields.data.cnisDocument;
        if (file.size === 0) throw new Error('O arquivo enviado está vazio.');
        if (file.size > 25 * 1024 * 1024) throw new Error('O PDF deve ter no máximo 25 MB.');

        const bytes = Buffer.from(await file.arrayBuffer());
        // O MIME type pode chegar vazio ou como application/octet-stream na Vercel.
        // A assinatura `%PDF-` é a validação confiável do formato real.
        const isPdf = bytes.subarray(0, 5).toString('ascii') === '%PDF-';
        if (!isPdf) throw new Error('O arquivo enviado não parece ser um PDF válido.');
        const result = await analyzeCnisPdf(bytes);
        return {
            message: 'Análise do CNIS concluída!',
            data: result,
        };
    } catch (error: any) {
        console.error("[ACTION] Erro CNIS:", error);
        return {
            message: error?.message || "Falha ao analisar o CNIS. O documento pode ser incompatível.",
        };
    }
}
