"use server";

import { z } from "zod";
import { generateLegalPetition } from "@/ai/flows/generate-legal-petition";
import { summarizeCnisAnalysis } from "@/ai/flows/summarize-cnis-analysis";
import { extractPapData } from "@/aiflows/extract-pap-data";
import { analyzePppDocument } from "@/ai/flows/analyze-ppp-document";
import { analyzeRetirementEligibility } from "@/ai/flows/analyze-retirement-eligibility";

// Schema for Legal Petition Generation
const petitionSchema = z.object({
  seguradoData: z.string().min(10, "Por favor, insira os dados do segurado."),
  tipoPetição: z.enum(["administrativo", "judicial"], {
    errorMap: () => ({ message: "Selecione um tipo de petição válido." }),
  }),
});

interface PetitionState {
  errors?: {
    seguradoData?: string[];
    tipoPetição?: string[];
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
    seguradoData: formData.get("seguradoData"),
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
    console.error(error);
    return {
      message: "Falha ao gerar a petição. Tente novamente.",
    };
  }
}


// Schema for CNIS Analysis
const cnisSchema = z.object({
    cnisData: z.string().min(50, "Os dados do CNIS parecem muito curtos. Por favor, cole o texto completo."),
});

interface CnisState {
    errors?: { cnisData?: string[] };
    message?: string | null;
    data?: { summary: string; } | null;
}

export async function analyzeCnisAction(prevState: CnisState, formData: FormData): Promise<CnisState> {
    const validatedFields = cnisSchema.safeParse({
        cnisData: formData.get("cnisData"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Dados inválidos.',
        };
    }

    try {
        const result = await summarizeCnisAnalysis(validatedFields.data);
        return {
            message: 'Análise do CNIS concluída!',
            data: result,
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'Falha ao analisar o CNIS. Tente novamente.',
        };
    }
}

// Schema for PAP Analysis
const papSchema = z.object({
    papDataUri: z.string().min(1, 'O arquivo é obrigatório.'),
});

interface PapState {
    errors?: { papDataUri?: string[] };
    message?: string | null;
    data?: {
        vínculos: {
            empregador: string;
            funcao: string;
            dataInicio: string;
            dataFim: string;
            salario: string;
        }[];
    } | null;
}

export async function analyzePapAction(prevState: PapState, formData: FormData): Promise<PapState> {
    const validatedFields = papSchema.safeParse({
        papDataUri: formData.get('papDataUri'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Dados inválidos.',
        };
    }
    
    try {
        const result = await extractPapData(validatedFields.data);
        return {
            message: 'Análise do PAP concluída!',
            data: result,
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'Falha ao analisar o PAP. O formato do arquivo pode ser inválido.',
        };
    }
}

// Schema for PPP Analysis
const pppSchema = z.object({
  pppDocumentUri: z.string().min(1, "O upload do documento PPP é obrigatório."),
});

interface PppState {
  errors?: { pppDocumentUri?: string[] };
  message?: string | null;
  data?: {
    nomeTrabalhador: string;
    empregador: string;
    resumoGeral: string;
    registrosExposicao: {
      periodo: string;
      fatorDeRisco: string;
      intensidade: string;
      tecnicaUtilizada: string;
      epcEficaz: string;
      epiEficaz: string;
    }[];
  } | null;
}

export async function analyzePppAction(
  prevState: PppState,
  formData: FormData
): Promise<PppState> {
  const validatedFields = pppSchema.safeParse({
    pppDocumentUri: formData.get("pppDocumentUri"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Dados inválidos. Verifique o formulário.",
    };
  }

  try {
    const result = await analyzePppDocument(validatedFields.data);
    return {
      message: "Análise do PPP concluída com sucesso!",
      data: result,
    };
  } catch (error) {
    console.error("Error analyzing PPP:", error);
    return {
      message: "Ocorreu um erro ao analisar o documento PPP. Verifique o formato do arquivo ou tente novamente.",
    };
  }
}

// Schema for Retirement Eligibility Analysis
const retirementSchema = z.object({
  collectedData: z.string().min(50, "Por favor, insira os dados consolidados do segurado."),
});

interface RetirementState {
  errors?: {
    collectedData?: string[];
  };
  message?: string | null;
  data?: {
    geralSummary: string;
    retirementByAge: {
      isEligible: boolean;
      details: string;
      supportingDocuments: string[];
    };
    retirementByContributionTime: {
      isEligible: boolean;
      details: string;
      supportingDocuments: string[];
    };
    specialRetirement: {
      isEligible: boolean;
      details: string;
      supportingDocuments: string[];
    };
  } | null;
}

export async function analyzeRetirementAction(
  prevState: RetirementState,
  formData: FormData
): Promise<RetirementState> {
  const validatedFields = retirementSchema.safeParse({
    collectedData: formData.get("collectedData"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Dados inválidos.",
    };
  }

  try {
    const result = await analyzeRetirementEligibility(validatedFields.data);
    return {
      message: "Análise de elegibilidade concluída!",
      data: result,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Falha ao realizar a análise. Tente novamente.",
    };
  }
}
