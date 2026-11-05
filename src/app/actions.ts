"use server";

import { z } from "zod";
import { generateLegalPetition } from "@/ai/flows/generate-legal-petition";
import { analyzeCnisPdf } from "@/lib/cnis-analyzer";
import { safeErrorMessage } from "@/lib/cnis-privacy";
import { validateCnisUpload } from "@/lib/cnis-upload";

// Schema for Legal Petition Generation
const petitionSchema = z.object({
  document: z.instanceof(File, { message: "O upload do documento é obrigatório." }),
  tipoPetição: z.enum(["administrativo", "judicial"], {
    errorMap: () => ({ message: "Selecione um tipo de petição válido." }),
  }),
});

interface PetitionState {
  errors?: {
    tipoPetição?: string[];
    document?: string[];
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
    document: formData.get("document"),
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
  } catch (error) {
    console.error("[ACTION] Falha operacional na geração de petição.", error instanceof Error ? error.name : "erro_desconhecido");
    return {
      message: safeErrorMessage(error) || "Falha ao gerar a petição. Tente novamente.",
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
        const bytes = Buffer.from(await file.arrayBuffer());
        const validationError = validateCnisUpload({ size: file.size, bytes });
        if (validationError) throw new Error(validationError);
        const result = await analyzeCnisPdf(bytes);
        return {
            message: 'Análise do CNIS concluída!',
            data: result,
        };
    } catch (error) {
        console.error("[ACTION] Falha operacional na análise CNIS.", error instanceof Error ? error.name : "erro_desconhecido");
        return {
            message: safeErrorMessage(error) || "Falha ao analisar o CNIS. O documento pode ser incompatível.",
        };
    }
}
