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
  prompt: `You are an expert actuary specializing in extracting employment history from PAP (Perfil de Atividade Profissional) documents. You will extract all employment records, including employer, role, start date, end date, and salary.

Extract the data from the following PAP document: {{media url=papDataUri}}

Output the data as a JSON object with a single key called "vínculos". The value of the "vínculos" key should be a JSON array of objects, where each object represents one employment record. Each employment record should have the following keys:

- empregador: The employer name.
- funcao: The role or job title.
- dataInicio: The start date of the employment.
- dataFim: The end date of the employment.
- salario: The salary for the role.

Make sure that the output is valid JSON.

Here is an example of the output format:

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
