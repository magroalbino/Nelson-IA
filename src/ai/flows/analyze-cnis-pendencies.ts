'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCnisPendenciesInputSchema = z.object({
  cnisDocumentUri: z.string(),
});

// Tornando o esquema mais flexível para evitar erros de validação da IA
const PendencySchema = z.object({
    indicator: z.string(),
    description: z.string(),
    recommendedAction: z.string(),
    relatedPeriods: z.array(z.string()).optional().default([]),
    severity: z.string().describe("baixa, média ou alta")
});

const AnalyzeCnisPendenciesOutputSchema = z.object({
    qualityScore: z.number(),
    riskLevel: z.string().describe("baixo, médio ou alto"),
    contributionStatus: z.string(),
    pendencies: z.array(PendencySchema),
    summary: z.string(),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string())
});

export async function analyzeCnisPendencies(input: { cnisDocumentUri: string }) {
  console.log("[CNIS] Iniciando análise...");
  
  // Validação básica do Data URI
  if (!input.cnisDocumentUri.startsWith('data:')) {
    console.error("[CNIS] Formato de documento inválido (não é data URI)");
    throw new Error("Documento em formato inválido.");
  }

  try {
    const result = await analyzeCnisPendenciesFlow(input);
    console.log("[CNIS] Análise concluída.");
    return result;
  } catch (error: any) {
    console.error("[CNIS] Erro no flow:", error?.message || error);
    // Retornar erro amigável para a Action
    throw new Error(error?.message || "Erro desconhecido na análise.");
  }
}

const prompt = ai.definePrompt({
  name: 'analyzeCnisPendenciesPrompt',
  input: {schema: AnalyzeCnisPendenciesInputSchema},
  output: {schema: AnalyzeCnisPendenciesOutputSchema},
  prompt: `Você é o Nelson, advogado previdenciário sênior. Sua tarefa é analisar o CNIS fornecido.
  
  DOCUMENTO: {{media url=cnisDocumentUri}}
  
  Extraia todos os indicadores de pendência. 
  Para cada um, forneça descrição e ação recomendada.
  Avalie o score de qualidade (0-100) e o risco (baixo, médio, alto).
  Dê um resumo estratégico e próximos passos.`,
});

const analyzeCnisPendenciesFlow = ai.defineFlow(
  {
    name: 'analyzeCnisPendenciesFlow',
    inputSchema: AnalyzeCnisPendenciesInputSchema,
    outputSchema: AnalyzeCnisPendenciesOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        if (!output) throw new Error("A IA não conseguiu processar este documento.");
        return output;
    } catch (e: any) {
        console.error("[CNIS] Erro na chamada do prompt:", e);
        throw e;
    }
  }
);
