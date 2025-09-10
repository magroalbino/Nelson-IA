// A Genkit flow for generating legal petitions and procedural documents.

'use server';

/**
 * @fileOverview A legal petition generation AI agent.
 *
 * - generateLegalPetition - A function that generates legal petitions.
 * - GenerateLegalPetitionInput - The input type for the generateLegalPetition function.
 * - GenerateLegalPetitionOutput - The return type for the generateLegalPetition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLegalPetitionInputSchema = z.object({
  seguradoData: z
    .string()
    .describe('All data related to the client, CNIS, PAP, PPP, and eligibility analysis.'),
  tipoPetição: z
    .string()
    .describe(
      'The type of legal petition to generate (administrativo ou judicial).'
    ),
});
export type GenerateLegalPetitionInput = z.infer<typeof GenerateLegalPetitionInputSchema>;

const GenerateLegalPetitionOutputSchema = z.object({
  peticao: z.string().describe('The generated legal petition.'),
  documentosAnexos: z
    .string()
    .describe('Suggestions for documents to attach to the petition.'),
});
export type GenerateLegalPetitionOutput = z.infer<typeof GenerateLegalPetitionOutputSchema>;

export async function generateLegalPetition(
  input: GenerateLegalPetitionInput
): Promise<GenerateLegalPetitionOutput> {
  return generateLegalPetitionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLegalPetitionPrompt',
  input: {
    schema: GenerateLegalPetitionInputSchema,
  },
  output: {
    schema: GenerateLegalPetitionOutputSchema,
  },
  prompt: `You are a highly skilled legal professional, expert in Brazilian social security law.

  Based on the data provided for the client, generate a legal petition of the specified type (administrativo ou judicial).
  The legal petition should include all relevant legal arguments and be pre-filled with the client's data.
  Also provide suggestions of documents that must be attached to the petition.

  Client Data: {{{seguradoData}}}
  Petition Type: {{{tipoPetição}}}
  `,
});

const generateLegalPetitionFlow = ai.defineFlow(
  {
    name: 'generateLegalPetitionFlow',
    inputSchema: GenerateLegalPetitionInputSchema,
    outputSchema: GenerateLegalPetitionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
