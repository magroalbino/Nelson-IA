'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCnisPendenciesInputSchema = z.object({
  cnisDocumentUri: z.string(),
});

const PendencySchema = z.object({
    indicator: z.string(),
    description: z.string(),
    recommendedAction: z.string(),
    relatedPeriods: z.array(z.string()),
    severity: z.enum(['baixa', 'média', 'alta'])
});

const AnalyzeCnisPendenciesOutputSchema = z.object({
    qualityScore: z.number(),
    riskLevel: z.enum(['baixo', 'médio', 'alto']),
    contributionStatus: z.string(),
    pendencies: z.array(PendencySchema),
    summary: z.string(),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string())
});

export async function analyzeCnisPendencies(input: { cnisDocumentUri: string }) {
  console.log("[CNIS] Iniciando análise...");
  try {
    const result = await analyzeCnisPendenciesFlow(input);
    console.log("[CNIS] Análise concluída com sucesso.");
    return result;
  } catch (error) {
    console.error("[CNIS] Erro fatal no flow:", error);
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'analyzeCnisPendenciesPrompt',
  input: {schema: AnalyzeCnisPendenciesInputSchema},
  output: {schema: AnalyzeCnisPendenciesOutputSchema},
  prompt: `Você é o Nelson, advogado previdenciário sênior. Analise o CNIS: {{media url=cnisDocumentUri}}
Extraia indicadores, explique significados e sugira ações. Use 'baixo'/'médio'/'alto' e 'baixa'/'média'/'alta'.`,
});

const analyzeCnisPendenciesFlow = ai.defineFlow(
  {
    name: 'analyzeCnisPendenciesFlow',
    inputSchema: AnalyzeCnisPendenciesInputSchema,
    outputSchema: AnalyzeCnisPendenciesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error("A IA não retornou um resultado válido.");
    return output;
  }
);
