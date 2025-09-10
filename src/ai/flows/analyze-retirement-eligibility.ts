'use server';

/**
 * @fileOverview An AI agent for analyzing retirement eligibility.
 *
 * - analyzeRetirementEligibility - A function that handles the retirement eligibility analysis process.
 * - AnalyzeRetirementEligibilityInput - The input type for the analyzeRetirementEligibility function.
 * - AnalyzeRetirementEligibilityOutput - The return type for the analyzeRetirementEligibility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRetirementEligibilityInputSchema = z.object({
  collectedData: z
    .string()
    .describe(
      'A compilation of all available data for the individual, including CNIS summary, PAP employment records, and PPP exposure analysis.'
    ),
});
export type AnalyzeRetirementEligibilityInput = z.infer<typeof AnalyzeRetirementEligibilityInputSchema>;

const EligibilityResultSchema = z.object({
    isEligible: z.boolean().describe("Indica se o segurado é elegível para esta modalidade de aposentadoria."),
    details: z.string().describe("Detalhes da análise, como tempo de contribuição calculado, idade, pontos, e o que falta se não for elegível. A fundamentação deve ser baseada nas regras da legislação previdenciária brasileira."),
    supportingDocuments: z.array(z.string()).describe("Documentos que suportam a conclusão ou que são necessários."),
});

const AnalyzeRetirementEligibilityOutputSchema = z.object({
  geralSummary: z.string().describe("Um resumo geral da situação previdenciária do segurado com base nos dados fornecidos."),
  retirementByAge: EligibilityResultSchema.describe("Análise para aposentadoria por idade."),
  retirementByContributionTime: EligibilityResultSchema.describe("Análise para aposentadoria por tempo de contribuição."),
  specialRetirement: EligibilityResultSchema.describe("Análise para aposentadoria especial (considerando exposição a agentes nocivos)."),
});
export type AnalyzeRetirementEligibilityOutput = z.infer<typeof AnalyzeRetirementEligibilityOutputSchema>;


export async function analyzeRetirementEligibility(input: AnalyzeRetirementEligibilityInput): Promise<AnalyzeRetirementEligibilityOutput> {
  return analyzeRetirementEligibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRetirementEligibilityPrompt',
  input: {schema: AnalyzeRetirementEligibilityInputSchema},
  output: {schema: AnalyzeRetirementEligibilityOutputSchema},
  prompt: `Você é um advogado especialista em direito previdenciário brasileiro e sua tarefa é realizar uma análise de elegibilidade para aposentadoria.

Analise os dados compilados fornecidos abaixo, que incluem resumos do CNIS, registros do PAP e análises de PPP.

Dados Compilados do Segurado:
{{{collectedData}}}

Com base nesses dados, avalie a elegibilidade do segurado para as seguintes modalidades de aposentadoria, **baseando-se estritamente nas regras da legislação previdenciária brasileira (Lei 8.213/91, EC 103/2019 e demais legislações aplicáveis)**:
1.  **Aposentadoria por Idade**: Verifique idade e tempo de contribuição.
2.  **Aposentadoria por Tempo de Contribuição**: Verifique o tempo total de contribuição e as regras de pedágio, se aplicável.
3.  **Aposentadoria Especial**: Verifique o tempo de exposição a agentes nocivos conforme os dados do PPP.

Para cada modalidade, forneça:
- **isEligible**: Um booleano (true/false).
- **details**: Uma explicação clara, indicando o tempo de contribuição calculado, a idade na data da análise, os pontos (se aplicável), e o que falta para atingir os requisitos se a pessoa não for elegível.
- **supportingDocuments**: Uma lista de documentos que foram ou seriam essenciais para essa análise.

Forneça também um **geralSummary** com uma visão geral e conclusiva sobre a situação previdenciária do segurado.

Seja preciso e baseie-se estritamente nas regras da previdência social brasileira. Se faltarem dados para uma análise conclusiva, indique isso nos detalhes.`,
});

const analyzeRetirementEligibilityFlow = ai.defineFlow(
  {
    name: 'analyzeRetirementEligibilityFlow',
    inputSchema: AnalyzeRetirementEligibilityInputSchema,
    outputSchema: AnalyzeRetirementEligibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
