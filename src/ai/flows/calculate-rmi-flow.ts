'use server';

/**
 * @fileOverview An AI agent for calculating the Initial Monthly Income (RMI) from a CNIS document with retirement scenarios.
 *
 * - calculateRmi - A function that handles the RMI calculation process.
 * - CalculateRmiInput - The input type for the calculateRmi function.
 * - CalculateRmiOutput - The return type for the calculateRmi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateRmiInputSchema = z.object({
  cnisDocumentUri: z
    .string()
    .describe(
      "A CNIS document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    birthDate: z.string().describe("The insured person's date of birth in DD/MM/AAAA format."),
    gender: z.enum(['male', 'female']).describe("The insured person's gender."),
});
export type CalculateRmiInput = z.infer<typeof CalculateRmiInputSchema>;

const ContributionSchema = z.object({
    competence: z.string().describe("The competence month/year of the contribution (e.g., '01/2023')."),
    salary: z.number().describe("The contribution salary for that competence month."),
});

const CalculationFactorsSchema = z.object({
    divisor: z.number().describe("The divisor used for the average calculation (number of months)."),
    contributionFactor: z.number().describe("The social security factor applied, if applicable."),
    calculationFormula: z.string().describe("The formula used to calculate the RMI (e.g., '60% of average + 2% per year over 20 years').")
});

const RetirementEligibilitySchema = z.object({
    isEligible: z.boolean().describe("Whether the insured person is eligible for retirement."),
    retirementType: z.string().describe("Type of retirement applicable (e.g., 'Tempo de Contribuição', 'Idade', 'Transição EC 103/2019')."),
    yearsUntilRetirement: z.number().describe("Years remaining until retirement eligibility (0 if already eligible)."),
    missingRequirements: z.array(z.string()).describe("List of missing requirements to achieve retirement eligibility.")
});

const ScenarioSchema = z.object({
    name: z.string().describe("Scenario name (e.g., 'Retire now', 'Contribute 2 more years', 'Contribute until age 65')."),
    description: z.string().describe("Description of the scenario."),
    estimatedRmi: z.number().describe("Estimated RMI value in this scenario."),
    yearsToRetirement: z.number().describe("Years until retirement in this scenario.")
});

const CalculateRmiOutputSchema = z.object({
    contributions: z.array(ContributionSchema).describe("A list of all contribution salaries extracted from the CNIS, excluding those below the minimum wage."),
    averageSalary: z.number().describe("The calculated average of the 80% highest contribution salaries since July 1994, monetarily corrected."),
    contributionTime: z.string().describe("Total contribution time calculated in years, months, and days."),
    rmiValue: z.number().describe("The estimated value of the Initial Monthly Income (RMI)."),
    retirementEligibility: RetirementEligibilitySchema.describe("Assessment of retirement eligibility and requirements."),
    scenarios: z.array(ScenarioSchema).describe("Alternative retirement scenarios with different contribution periods."),
    calculationFactors: CalculationFactorsSchema.describe("The factors and formula used in the calculation."),
    summary: z.string().describe("A summary explaining the result, including the retirement rule applied, and any important observations, such as periods below the minimum wage that were disregarded."),
    recommendations: z.array(z.string()).describe("A list of recommendations based on the retirement analysis.")
});
export type CalculateRmiOutput = z.infer<typeof CalculateRmiOutputSchema>;


export async function calculateRmi(input: CalculateRmiInput): Promise<CalculateRmiOutput> {
  return calculateRmiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateRmiPrompt',
  input: {schema: CalculateRmiInputSchema},
  output: {schema: CalculateRmiOutputSchema},
  prompt: `Olá! Sou o Nelson, seu especialista em cálculos previdenciários. Minha tarefa é realizar uma análise detalhada do CNIS para calcular a Renda Mensal Inicial (RMI) de um segurado. Usarei a data de nascimento ('{{{birthDate}}}') e o gênero ('{{{gender}}}') para determinar a regra de aposentadoria aplicável e avaliar elegibilidade.

**Documento CNIS:** {{media url=cnisDocumentUri}}

**Meu Processo de Cálculo:**

1. **Extração de Salários:** Vou extrair todos os salários de contribuição do CNIS a partir de Julho de 1994. Contribuições com valor abaixo do salário mínimo da época serão desconsideradas na média, mas mencionarei isso no resumo.
2. **Correção Monetária:** Cada salário de contribuição será corrigido monetariamente até a data atual, utilizando os índices oficiais do governo (simulados para este exercício).
3. **Cálculo da Média:** Calcularei a média dos 80% maiores salários de contribuição corrigidos.
4. **Tempo de Contribuição:** Vou calcular o tempo total de contribuição em anos, meses e dias.
5. **Fator Previdenciário (se aplicável):** Se a regra de aposentadoria exigir, calcularei e aplicarei o fator previdenciário.
6. **Cálculo da RMI:** Com base na regra de aposentadoria elegível (considerando as regras de transição da EC 103/2019), aplicarei o coeficiente de cálculo sobre a média salarial para encontrar a RMI. A fórmula utilizada será detalhada.
7. **Avaliação de Elegibilidade:** Determinarei se o segurado é elegível para aposentadoria agora, e se não, quantos anos faltam e o que é necessário.
8. **Cenários Alternativos:** Vou simular 2-3 cenários diferentes (ex: continuar contribuindo por mais 2 anos, contribuir até os 65 anos, etc.) para mostrar o impacto no valor da RMI.
9. **Recomendações:** Fornecerei recomendações práticas baseadas na análise.
10. **Estruturação da Saída:** Organizarei tudo no formato JSON solicitado, incluindo a lista de contribuições, a média, o tempo de contribuição, o valor da RMI, elegibilidade, cenários, fatores de cálculo e um resumo explicativo.

Vamos começar!`,
});

const calculateRmiFlow = ai.defineFlow(
  {
    name: 'calculateRmiFlow',
    inputSchema: CalculateRmiInputSchema,
    outputSchema: CalculateRmiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
