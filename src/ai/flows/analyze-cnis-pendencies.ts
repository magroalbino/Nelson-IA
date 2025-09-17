'use server';

/**
 * @fileOverview An AI agent for analyzing CNIS pendencies (indicators) and providing a strategic overview.
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
    description: z.string().describe("A clear and objective explanation of what the pendency means for the client's retirement, according to INSS norms."),
    recommendedAction: z.string().describe("The recommended action or necessary documentation to resolve the issue, based on official procedures."),
    relatedPeriods: z.array(z.string()).describe("The contribution periods (e.g., '01/01/2020 - 31/12/2020') associated with this pendency.")
});

const AnalyzeCnisPendenciesOutputSchema = z.object({
    pendencies: z.array(PendencySchema).describe("A list of all identified pendencies in the CNIS document."),
    summary: z.string().describe("A strategic summary about the identified pendencies, the overall quality of the contributions, and whether it's advisable to continue contributing to improve the retirement benefit. It should also mention the possibility of retroactive payments for specific periods if any are identified.")
});
export type AnalyzeCnisPendenciesOutput = z.infer<typeof AnalyzeCnisPendenciesOutputSchema>;


export async function analyzeCnisPendencies(input: AnalyzeCnisPendenciesInput): Promise<AnalyzeCnisPendenciesOutput> {
  return analyzeCnisPendenciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCnisPendenciesPrompt',
  input: {schema: AnalyzeCnisPendenciesInputSchema},
  output: {schema: AnalyzeCnisPendenciesOutputSchema},
  prompt: `Sou Túlio, seu assistente previdenciário. Minha especialidade é decifrar os detalhes de um Extrato de Contribuição (CNIS) do INSS. Minha tarefa é realizar uma análise completa e estratégica do texto do CNIS fornecido, como um advogado sênior faria, baseando-me nas normas e legislação do INSS.

Vamos analisar juntos o texto do CNIS:
{{{cnisText}}}

Minha análise será dividida em duas partes para facilitar nosso entendimento:

**1. Lista de Pendências e Indicadores:**
Para cada pendência ou indicador que eu encontrar (ex: PEXT, PREC-MENOR-MIN, AEXT-VI, PADM-EMPR, etc.), vou extrair e estruturar as seguintes informações para você:
- **indicator**: A sigla exata do indicador.
- **description**: Uma explicação clara e objetiva do que essa pendência significa para o segurado e seu processo de aposentadoria, conforme as normativas do INSS. Vou traduzir o "jargão" do INSS para você.
- **recommendedAction**: Qual é a ação recomendada ou quais documentos são necessários para tratar ou resolver essa pendência. Serei específico e prático, de acordo com os procedimentos oficiais.
- **relatedPeriods**: Uma lista dos períodos (no formato "DD/MM/AAAA - DD/MM/AAAA") que estão associados a essa pendência.

**2. Resumo Estratégico (summary):**
Elaborarei um resumo que vai além da simples lista. Pense nisso como meu parecer estratégico sobre o caso:
- Uma avaliação da qualidade geral do histórico de contribuições.
- A menção explícita sobre a possibilidade de pagar contribuições retroativas para períodos específicos, caso eu identifique lacunas ou indicadores que permitam essa ação, explicando brevemente o fundamento.
- Uma análise sobre a viabilidade de continuar contribuindo, mesmo que o tempo de carência já tenha sido atingido, explicando como isso pode impactar o valor final do benefício.
- Uma conclusão sobre a importância de regularizar todos os indicadores antes de qualquer pedido de benefício para evitar indeferimentos ou atrasos.

Se eu não encontrar nenhum indicador, retornarei uma lista de pendências vazia e um resumo informando que o extrato parece estar regular, mas ainda assim, fornecerei uma análise estratégica geral sobre a qualidade das contribuições.`,
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
