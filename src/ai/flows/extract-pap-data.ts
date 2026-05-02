'use server';

/**
 * @fileOverview A PAP data extraction AI agent with strategic analysis.
 *
 * - extractPapData - A function that handles the PAP data extraction process.
 * - ExtractPapDataInput - The input type for the extractPapData function.
 * - ExtractPapDataOutput - The return type for the extractPapData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPapDataInputSchema = z.object({
  papDataUri: z
    .string()
    .describe(
      "A PAP document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractPapDataInput = z.infer<typeof ExtractPapDataInputSchema>;

const ExtractPapDataOutputSchema = z.object({
  totalPeriods: z.string().describe('Total contribution period in the format "X years, Y months, Z days".'),
  totalEmployers: z.number().describe('Total number of distinct employers.'),
  averageSalary: z.string().describe('Average salary across all employment periods.'),
  qualityIndicators: z.string().describe('Assessment of data quality and consistency in the PAP.'),
  strategicSummary: z.string().describe('A strategic summary of the employment history, highlighting key periods, salary progression, and any notable gaps or inconsistencies.'),
  alerts: z.array(z.object({
    type: z.enum(['info', 'warning', 'error']).describe('Alert type.'),
    message: z.string().describe('Alert message.')
  })).describe('A list of alerts or observations about the employment record.'),
  vínculos: z
    .array(
      z.object({
        empregador: z.string().describe('The employer name.'),
        funcao: z.string().describe('The role or job title.'),
        dataInicio: z.string().describe('The start date of the employment.'),
        dataFim: z.string().describe('The end date of the employment.'),
        salario: z.string().describe('The salary for the role.'),
        duration: z.string().describe('Duration of employment in the format "X years, Y months, Z days".')
      })
    )
    .describe('A list of employment records extracted from the PAP document.'),
  recommendations: z.array(z.string()).describe('A list of recommendations based on the employment history analysis.')
});
export type ExtractPapDataOutput = z.infer<typeof ExtractPapDataOutputSchema>;

export async function extractPapData(input: ExtractPapDataInput): Promise<ExtractPapDataOutput> {
  return extractPapDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPapDataPrompt',
  input: {schema: ExtractPapDataInputSchema},
  output: {schema: ExtractPapDataOutputSchema},
  prompt: `Olá! Sou o Nelson, seu assistente previdenciário. Como um especialista em análise de documentos, minha tarefa é extrair e analisar o histórico de vínculos de documentos PAP (Perfil de Atividade Profissional). Vou extrair todos os registros de emprego, calcular períodos, identificar padrões e fornecer uma análise estratégica.

Vamos analisar os dados do documento PAP que você enviou: {{media url=papDataUri}}

Minha análise incluirá:

1. **Extração de Vínculos**: Todos os registros de emprego com empregador, função, datas e salário.
2. **Cálculos**: Período total de contribuição, número de empregadores, salário médio.
3. **Análise de Qualidade**: Avaliação da consistência e qualidade dos dados.
4. **Resumo Estratégico**: Uma visão geral do histórico profissional, progressão salarial, lacunas e inconsistências.
5. **Alertas**: Identificação de possíveis problemas ou pontos de atenção (ex: períodos sem registro, salários inconsistentes, lacunas temporais).
6. **Recomendações**: Sugestões práticas baseadas na análise (ex: documentos faltantes, períodos a regularizar).

Vou organizar os dados em um JSON estruturado e preciso.`,
});

const extractPapDataFlow = ai.defineFlow(
  {
    name: 'extractPapDataFlow',
    inputSchema: ExtractPapDataInputSchema,
    outputSchema: ExtractPapDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
