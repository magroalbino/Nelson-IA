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
    relatedPeriods: z.array(z.string()).optional().default([]),
    severity: z.string().describe("baixa, média ou alta")
});

const AnalyzeCnisPendenciesOutputSchema = z.object({
    qualityScore: z.number(),
    riskLevel: z.string().describe("baixo, médio ou alto"),
    contributionStatus: z.string(),
    // Novos campos para estimativa de aposentadoria
    tempoContribuicaoTotal: z.string().describe("Ex: 25 anos, 4 meses e 10 dias"),
    carenciaTotal: z.number().describe("Número total de meses de carência"),
    estimativaAposentadoria: z.string().describe("Uma previsão amigável de quando poderá se aposentar"),
    progressoAposentadoria: z.number().min(0).max(100).describe("Percentual de progresso rumo à aposentadoria (0-100)"),
    
    pendencies: z.array(PendencySchema),
    summary: z.string(),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string())
});

export async function analyzeCnisPendencies(input: { cnisDocumentUri: string }) {
  console.log("[CNIS] Iniciando análise estratégica...");
  
  if (!input.cnisDocumentUri.startsWith('data:')) {
    throw new Error("Documento em formato inválido.");
  }

  try {
    const result = await analyzeCnisPendenciesFlow(input);
    return result;
  } catch (error: any) {
    console.error("[CNIS] Erro no flow:", error?.message || error);
    throw new Error(error?.message || "Erro na análise. Verifique se o arquivo é um CNIS válido.");
  }
}

const prompt = ai.definePrompt({
  name: 'analyzeCnisPendenciesPrompt',
  input: {schema: AnalyzeCnisPendenciesInputSchema},
  output: {schema: AnalyzeCnisPendenciesOutputSchema},
  prompt: `Você é o Nelson, advogado previdenciário sênior. Sua missão é realizar uma análise ESTRATÉGICA do CNIS.
  
  DOCUMENTO: {{media url=cnisDocumentUri}}
  
  TAREFAS:
  1. Identifique todos os indicadores de pendência (PEXT, AEXT, etc).
  2. Calcule uma ESTIMATIVA do tempo de contribuição total e carência (meses pagos).
  3. Determine o progresso (0-100%) rumo à aposentadoria por tempo de contribuição (base 35 anos homens / 30 anos mulheres).
  4. Forneça uma previsão amigável: "Faltam aproximadamente X anos" ou "Você já pode solicitar!".
  5. Avalie a qualidade dos dados (score 0-100).
  
  Linguagem: Use um tom acolhedor para o segurado, mas técnico para o advogado.`,
});

const analyzeCnisPendenciesFlow = ai.defineFlow(
  {
    name: 'analyzeCnisPendenciesFlow',
    inputSchema: AnalyzeCnisPendenciesInputSchema,
    outputSchema: AnalyzeCnisPendenciesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error("A IA não conseguiu processar os dados deste CNIS.");
    return output;
  }
);
