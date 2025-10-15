'use server';

/**
 * @fileOverview A PAP data extraction AI agent.
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
  vínculos: z
    .array(
      z.object({
        empregador: z.string().describe('The employer name.'),
        funcao: z.string().describe('The role or job title.'),
        dataInicio: z.string().describe('The start date of the employment.'),
        dataFim: z.string().describe('The end date of the employment.'),
        salario: z.string().describe('The salary for the role.'),
      })
    )
    .describe('A list of employment records extracted from the PAP document.'),
});
export type ExtractPapDataOutput = z.infer<typeof ExtractPapDataOutputSchema>;

export async function extractPapData(input: ExtractPapDataInput): Promise<ExtractPapDataOutput> {
  return extractPapDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractPapDataPrompt',
  input: {schema: ExtractPapDataInputSchema},
  output: {schema: ExtractPapDataOutputSchema},
  prompt: `Olá! Sou o Nelson, seu assistente previdenciário. Como um especialista em análise de documentos, minha tarefa é extrair o histórico de vínculos de documentos PAP (Perfil de Atividade Profissional). Vou extrair todos os registros de emprego, incluindo empregador, função, data de início, data de término e salário.

Vamos analisar os dados do documento PAP que você enviou: {{media url=papDataUri}}

Vou organizar os dados para você em um objeto JSON com uma única chave chamada "vínculos". O valor será um array de objetos, onde cada objeto representa um vínculo empregatício com as seguintes chaves:

- empregador: O nome do empregador.
- funcao: O cargo ou função.
- dataInicio: A data de início do vínculo.
- dataFim: A data de término do vínculo.
- salario: O salário para o cargo.

Farei o meu melhor para garantir que o resultado seja um JSON válido e preciso.

Exemplo do formato da saída:
{
  "vínculos": [
    {
      "empregador": "Example Employer 1",
      "funcao": "Example Role 1",
      "dataInicio": "2020-01-01",
      "dataFim": "2021-01-01",
      "salario": "1000"
    },
    {
      "empregador": "Example Employer 2",
      "funcao": "Example Role 2",
      "dataInicio": "2021-01-01",
      "dataFim": "2022-01-01",
      "salario": "2000"
    }
  ]
}`,
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
