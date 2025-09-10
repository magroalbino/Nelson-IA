'use server';

/**
 * @fileOverview An AI agent for analyzing CNIS pendencies (indicators).
 *
 * - analyzeCnisPendencies - A function that handles the CNIS pendency analysis process.
 * - AnalyzeCnisPendenciesInput - The input type for the analyzeCnisPendencies function.
 * - AnalyzeCnisPendenciesOutput - The return type for the analyzeCnisPendencies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCnisPendenciesInputSchema = z.object({
  cnisText: z
    .string()
    .describe('The full text content of the CNIS document.'),
});
export type AnalyzeCnisPendenciesInput = z.infer<typeof AnalyzeCnisPendenciesInputSchema>;

const PendencySchema = z.object({
    indicator: z.string().describe("The acronym or indicator of the pendency (e.g., 'PEXT', 'AEXT-VI')."),
    description: z.string().describe("A clear and objective explanation of what the pendency means."),
    recommendedAction: z.string().describe("The recommended action or necessary documentation to resolve the issue."),
    relatedPeriods: z.array(z.string()).describe("The contribution periods (e.g., '01/01/2020 - 31/12/2020') associated with this pendency.")
});

const AnalyzeCnisPendenciesOutputSchema = z.object({
    pendencies: z.array(PendencySchema).describe("A list of all identified pendencies in the CNIS document."),
    summary: z.string().describe("A general summary about the identified pendencies and the overall situation of the contribution history.")
});
export type AnalyzeCnisPendenciesOutput = z.infer<typeof AnalyzeCnisPendenciesOutputSchema>;


export async function analyzeCnisPendencies(input: AnalyzeCnisPendenciesInput): Promise<AnalyzeCnisPendenciesOutput> {
  return analyzeCnisPendenciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCnisPendenciesPrompt',
  input: {schema: AnalyzeCnisPendenciesInputSchema},
  output: {schema: AnalyzeCnisPendenciesOutputSchema},
  prompt: `Você é um advogado previdenciarista sênior, especialista em decifrar os detalhes de um Extrato de Contribuição (CNIS) do INSS. Sua tarefa é analisar o texto do CNIS fornecido e identificar todas as pendências e indicadores existentes.

Analise o texto do CNIS:
{{{cnisText}}}

Para cada pendência ou indicador encontrado (ex: PEXT, PREC-MENOR-MIN, AEXT-VI, PADM-EMPR, etc.), você deve extrair e estruturar as seguintes informações:
1.  **indicator**: A sigla exata do indicador.
2.  **description**: Uma explicação clara e concisa do que essa pendência significa para o segurado.
3.  **recommendedAction**: Qual é a ação recomendada ou quais documentos são necessários para tratar ou resolver essa pendência. Seja específico.
4.  **relatedPeriods**: Uma lista dos períodos (no formato "DD/MM/AAAA - DD/MM/AAAA") que estão associados a essa pendência.

Além da lista de pendências, forneça um **summary** geral sobre a situação do extrato, alertando para a importância de regularizar os indicadores antes de um pedido de benefício.

Se nenhum indicador for encontrado, retorne uma lista de pendências vazia e um resumo informando que o extrato parece estar regular.`,
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
