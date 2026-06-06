'use server';

/**
 * @fileOverview An AI agent for analyzing CNIS pendencies (indicators) and providing a strategic overview from a document.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCnisPendenciesInputSchema = z.object({
  cnisDocumentUri: z
    .string()
    .describe(
      "A CNIS document, as a data URI that must include a MIME type and use Base64 encoding."
    ),
});
export type AnalyzeCnisPendenciesInput = z.infer<typeof AnalyzeCnisPendenciesInputSchema>;

const PendencySchema = z.object({
    indicator: z.string().describe("The acronym or indicator of the pendency (e.g., 'PEXT', 'AEXT-VI')."),
    description: z.string().describe("A clear and objective explanation of what the pendency means."),
    recommendedAction: z.string().describe("The recommended action to resolve the issue."),
    relatedPeriods: z.array(z.string()).describe("The contribution periods associated with this pendency."),
    severity: z.enum(['baixa', 'média', 'alta']).describe("The severity level: 'baixa', 'média', or 'alta'.")
});

const AnalyzeCnisPendenciesOutputSchema = z.object({
    qualityScore: z.number().min(0).max(100).describe("A quality score from 0 to 100."),
    riskLevel: z.enum(['baixo', 'médio', 'alto']).describe("Overall risk level: 'baixo', 'médio', or 'alto'."),
    contributionStatus: z.string().describe("A brief status description."),
    pendencies: z.array(PendencySchema).describe("A list of all identified pendencies."),
    summary: z.string().describe("A strategic summary about the identified pendencies."),
    recommendations: z.array(z.string()).describe("A list of 3-5 practical recommendations."),
    nextSteps: z.array(z.string()).describe("A list of immediate next steps.")
});
export type AnalyzeCnisPendenciesOutput = z.infer<typeof AnalyzeCnisPendenciesOutputSchema>;


export async function analyzeCnisPendencies(input: AnalyzeCnisPendenciesInput): Promise<AnalyzeCnisPendenciesOutput> {
  return analyzeCnisPendenciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCnisPendenciesPrompt',
  input: {schema: AnalyzeCnisPendenciesInputSchema},
  output: {schema: AnalyzeCnisPendenciesOutputSchema},
  prompt: `Você é o Nelson, um advogado previdenciário sênior especializado em análise de CNIS (Extrato de Contribuições do INSS).
Sua tarefa é analisar o documento fornecido e extrair todas as pendências, indicadores e informações estratégicas.

DOCUMENTO CNIS: {{media url=cnisDocumentUri}}

INSTRUÇÕES:
1. Analise cada linha do extrato em busca de indicadores (ex: PEXT, AEXT-VI, PREC-MENOR-MIN, PADM-EMPR, etc.).
2. Para cada indicador, explique em linguagem simples o que ele significa e como resolvê-lo.
3. Avalie a qualidade geral do documento (0-100) e o nível de risco para a aposentadoria.
4. Forneça um resumo estratégico, recomendações e próximos passos práticos.

IMPORTANTE: Use exatamente os valores 'baixo', 'médio' ou 'alto' para riskLevel e 'baixa', 'média' ou 'alta' para severity.`,
});

const analyzeCnisPendenciesFlow = ai.defineFlow(
  {
    name: 'analyzeCnisPendenciesFlow',
    inputSchema: AnalyzeCnisPendenciesInputSchema,
    outputSchema: AnalyzeCnisPendenciesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
