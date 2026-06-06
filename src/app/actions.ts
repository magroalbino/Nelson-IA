"use server";

import { z } from "zod";
import { generateLegalPetition } from "@/ai/flows/generate-legal-petition";
import { analyzeCnisPendencies } from "@/ai/flows/analyze-cnis-pendencies";
import React from "react";

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
      message: "Dados inválidos. Por favor, anexe o documento e selecione o tipo de petição.",
    };
  }

  try {
    const result = await generateLegalPetition(validatedFields.data);
    return {
      message: "Petição gerada com sucesso!",
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Falha ao gerar a petição. Tente novamente.",
    };
  }
}


// Schema for CNIS Analysis
const cnisSchema = z.object({
    cnisDocumentUri: z.string().min(1, 'O upload do documento CNIS é obrigatório.'),
});

interface CnisState {
    errors?: { cnisDocumentUri?: string[] };
    message?: string | null;
    data?: {
      qualityScore: number;
      riskLevel: 'baixo' | 'médio' | 'alto';
      contributionStatus: string;
      pendencies: {
        indicator: string;
        description: string;
        recommendedAction: string;
        relatedPeriods: string[];
        severity: 'baixa' | 'média' | 'alta';
      }[];
      summary: string;
      recommendations: string[];
      nextSteps: string[];
    } | null;
}

export async function analyzeCnisAction(prevState: CnisState, formData: FormData): Promise<CnisState> {
    const validatedFields = cnisSchema.safeParse({
        cnisDocumentUri: formData.get("cnisDocumentUri"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Dados inválidos.',
        };
    }

    try {
        const result = await analyzeCnisPendencies({ cnisDocumentUri: validatedFields.data.cnisDocumentUri });
        return {
            message: 'Análise do CNIS concluída!',
            data: result,
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'Falha ao analisar o CNIS. O formato do arquivo pode ser inválido ou o documento estar ilegível.',
        };
    }
}
