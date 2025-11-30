"use server";

import { z } from "zod";
import { generateLegalPetition } from "@/ai/flows/generate-legal-petition";
import { analyzeCnisPendencies } from "@/ai/flows/analyze-cnis-pendencies";
import { extractPapData } from "@/ai/flows/extract-pap-data";
import { analyzePppDocument } from "@/ai/flows/analyze-ppp-document";
import { analyzeRetirementEligibility } from "@/ai/flows/analyze-retirement-eligibility";
import { calculateRmi } from "@/ai/flows/calculate-rmi-flow";
import React from "react";

// Schema for Legal Petition Generation
const petitionSchema = z.object({
  seguradoData: z.string().optional(),
  documentUri: z.string().optional(),
  tipoPetição: z.enum(["administrativo", "judicial"], {
    errorMap: () => ({ message: "Selecione um tipo de petição válido." }),
  }),
}).refine(data => !!data.seguradoData || !!data.documentUri, {
    message: "Forneça os dados do segurado no campo de texto ou anexe um documento.",
    path: ["seguradoData"], // Assign error to one field for display
});


interface PetitionState {
  errors?: {
    seguradoData?: string[];
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
    seguradoData: formData.get("seguradoData"),
    documentUri: formData.get("documentUri"),
    tipoPetição: formData.get("tipoPetição"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: validatedFields.error.flatten().formErrors.join(', ') || "Dados inválidos.",
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
      pendencies: {
        indicator: string;
        description: string;
        recommendedAction: string;
        relatedPeriods: string[];
      }[];
      summary: string;
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
  cnisDocumentUri: z.string().optional(),
  papDocumentUri: z.string().optional(),
  pppDocumentUri: z.string().optional(),
  additionalData: z.string().optional(),
}).refine(data => !!data.cnisDocumentUri || !!data.papDocumentUri || !!data.pppDocumentUri || !!data.additionalData, {
  message: "Forneça pelo menos um documento ou informação adicional para análise.",
  path: ["cnisDocumentUri"], // Arbitrarily assign error to one field for display
});


interface RetirementState {
  errors?: {
    cnisDocumentUri?: string[];
    papDocumentUri?: string[];
    pppDocumentUri?: string[];
    additionalData?: string[];
  };
  message?: string | null;
  data?: {
    nomeSegurado: string;
    dataNascimento: string;
    vinculos: {
        type: 'contribuicao' | 'especial';
        startDate: string;
        endDate: string;
        fatorRisco?: string;
    }[];
    observacoes: string;
  } | null;
}

export async function analyzeRetirementAction(
  prevState: RetirementState,
  formData: FormData
): Promise<RetirementState> {
  const validatedFields = retirementSchema.safeParse({
    cnisDocumentUri: formData.get("cnisDocumentUri"),
    papDocumentUri: formData.get("papDocumentUri"),
    pppDocumentUri: formData.get("pppDocumentUri"),
    additionalData: formData.get("additionalData"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: validatedFields.error.flatten().formErrors[0] || "Dados inválidos.",
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
      message: "Falha ao realizar a análise. Verifique os arquivos ou tente novamente.",
    };
  }
}


// Schema for RMI Calculation
const rmiSchema = z.object({
  cnisDocumentUri: z.string().min(1, 'O upload do documento CNIS é obrigatório.'),
  birthDate: z.string().min(10, 'A data de nascimento é obrigatória.'),
  gender: z.enum(['male', 'female'], {
    errorMap: () => ({ message: "Selecione o gênero." }),
  })
});

interface RmiState {
    errors?: { 
      cnisDocumentUri?: string[];
      birthDate?: string[],
      gender?: string[]
    };
    message?: string | null;
    data?: {
      contributions: {
        competence: string;
        salary: number;
      }[];
      averageSalary: number;
      contributionTime: string;
      rmiValue: number;
      calculationFactors: {
        divisor: number;
        contributionFactor: number;
        calculationFormula: string;
      };
      summary: string;
    } | null;
}

export async function calculateRmiAction(prevState: RmiState, formData: FormData): Promise<RmiState> {
    const validatedFields = rmiSchema.safeParse({
        cnisDocumentUri: formData.get("cnisDocumentUri"),
        birthDate: formData.get("birthDate"),
        gender: formData.get("gender"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Dados inválidos.',
        };
    }

    try {
        const result = await calculateRmi(validatedFields.data);
        return {
            message: 'Cálculo de RMI concluído!',
            data: result,
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'Falha ao calcular a RMI. O documento CNIS pode estar ilegível ou em formato inesperado.',
        };
    }
}
