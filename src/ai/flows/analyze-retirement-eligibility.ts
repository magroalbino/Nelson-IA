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

const VinculoSchema = z.object({
    type: z.enum(['contribuicao', 'especial']).describe("Tipo de vínculo: 'contribuicao' para tempo comum, 'especial' para tempo com exposição a agentes nocivos."),
    startDate: z.string().describe("Data de início do período no formato AAAA-MM-DD."),
    endDate: z.string().describe("Data de fim do período no formato AAAA-MM-DD."),
    fatorRisco: z.string().optional().describe("Agente de risco, se o tipo for 'especial'."),
});

const AnalyzeRetirementEligibilityOutputSchema = z.object({
  nomeSegurado: z.string().describe("O nome completo do segurado."),
  dataNascimento: z.string().describe("A data de nascimento do segurado no formato AAAA-MM-DD."),
  vinculos: z.array(VinculoSchema).describe("Uma lista de todos os vínculos de contribuição, comuns e especiais, extraídos dos documentos."),
  observacoes: z.string().describe("Um campo de texto para observações importantes extraídas dos documentos que podem impactar o cálculo, como indicadores do CNIS que precisam de atenção (ex: 'PEXT', 'PREC-MENOR-MIN') ou informações sobre EPI/EPC do PPP.")
});
export type AnalyzeRetirementEligibilityOutput = z.infer<typeof AnalyzeRetirementEligibilityOutputSchema>;


export async function analyzeRetirementEligibility(input: AnalyzeRetirementEligibilityInput): Promise<AnalyzeRetirementEligibilityOutput> {
  return analyzeRetirementEligibilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRetirementEligibilityPrompt',
  input: {schema: AnalyzeRetirementEligibilityInputSchema},
  output: {schema: AnalyzeRetirementEligibilityOutputSchema},
  prompt: `Sou Túlio, seu assistente previdenciário. Minha especialidade é organizar dados complexos para cálculos precisos. Minha tarefa agora é funcionar como um "data extractor" de alta precisão.

**NÃO FAÇA CÁLCULOS. NÃO DETERMINE ELEGIBILIDADE.**

Sua única função é analisar os dados compilados que você recebeu e extrair as seguintes informações de forma estruturada, no formato JSON solicitado.

**Dados Compilados do Segurado:**
{{{collectedData}}}

**Informações a serem extraídas:**

1.  **nomeSegurado**: Extraia o nome completo do segurado.
2.  **dataNascimento**: Extraia a data de nascimento do segurado e formate-a como AAAA-MM-DD.
3.  **vinculos**: Crie uma lista de todos os períodos de trabalho/contribuição. Para cada período, identifique:
    *   **type**: Classifique como 'contribuicao' (se for um tempo de contribuição comum) ou 'especial' (se houver exposição a agentes nocivos, baseado no PPP).
    *   **startDate**: Data de início no formato AAAA-MM-DD.
    *   **endDate**: Data de fim no formato AAAA-MM-DD.
    *   **fatorRisco**: Se o tipo for 'especial', mencione qual foi o agente de risco principal (ex: "Ruído", "Sílica").
4.  **observacoes**: Crie um resumo em texto com pontos importantes que um calculista precisaria saber. Inclua coisas como:
    *   Indicadores de pendência do CNIS (ex: "PEXT", "AEXT-VI", "PREC-MENOR-MIN").
    *   Informações sobre a eficácia de EPI/EPC do PPP.
    *   Qualquer outra informação que pareça crítica para um cálculo previdenciário preciso.

Sua saída deve ser apenas o objeto JSON estruturado. A precisão na extração das datas e dos tipos de vínculo é fundamental para o próximo passo, que será o cálculo matemático feito pelo sistema.`,
});

const analyzeRetirementEligibilityFlow = ai.defineFlow(
  {
    name: 'analyzeRetirementEligibilityFlow',
    inputSchema: AnalyzeRetirementEligibilityInputSchema,
    outputSchema: AnalyzeRettenirementEligibilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
