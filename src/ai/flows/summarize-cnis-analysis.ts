'use server';

/**
 * @fileOverview Summarizes the CNIS analysis, highlighting key contribution periods and potential inconsistencies.
 *
 * - summarizeCnisAnalysis - A function that summarizes the CNIS analysis.
 * - SummarizeCnisAnalysisInput - The input type for the summarizeCnisAnalysis function.
 * - SummarizeCnisAnalysisOutput - The return type for the summarizeCnisAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCnisAnalysisInputSchema = z.object({
  cnisData: z
    .string()
    .describe("The extracted CNIS data as a string, including contribution periods and any identified inconsistencies."),
});
export type SummarizeCnisAnalysisInput = z.infer<typeof SummarizeCnisAnalysisInputSchema>;

const SummarizeCnisAnalysisOutputSchema = z.object({
  summary: z.string().describe("A concise summary of the CNIS analysis, highlighting key contribution periods and any potential inconsistencies found."),
});
export type SummarizeCnisAnalysisOutput = z.infer<typeof SummarizeCnisAnalysisOutputSchema>;

export async function summarizeCnisAnalysis(input: SummarizeCnisAnalysisInput): Promise<SummarizeCnisAnalysisOutput> {
  return summarizeCnisAnalysisFlow(input);
}

const summarizeCnisAnalysisPrompt = ai.definePrompt({
  name: 'summarizeCnisAnalysisPrompt',
  input: {schema: SummarizeCnisAnalysisInputSchema},
  output: {schema: SummarizeCnisAnalysisOutputSchema},
  prompt: `You are an expert retirement planner summarizing CNIS analysis for a client.

  Given the CNIS data below, provide a concise summary, highlighting key contribution periods and any potential inconsistencies.

  CNIS Data: {{{cnisData}}}
  `,
});

const summarizeCnisAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizeCnisAnalysisFlow',
    inputSchema: SummarizeCnisAnalysisInputSchema,
    outputSchema: SummarizeCnisAnalysisOutputSchema,
  },
  async input => {
    const {output} = await summarizeCnisAnalysisPrompt(input);
    return output!;
  }
);
