'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLegalPetitionInputSchema = z.object({
  documentUri: z.string(),
  tipoPetição: z.string(),
});

const GenerateLegalPetitionOutputSchema = z.object({
  peticao: z.string(),
  documentosAnexos: z.string(),
});

export async function generateLegalPetition(input: { documentUri: string, tipoPetição: string }) {
  console.log("[PETIÇÃO] Iniciando geração...");
  
  if (!input.documentUri.startsWith('data:')) {
    throw new Error("Documento em formato inválido.");
  }

  try {
    const result = await generateLegalPetitionFlow(input);
    return result;
  } catch (error: any) {
    console.error("[PETIÇÃO] Erro fatal:", error?.message || error);
    throw new Error(error?.message || "Erro na geração da petição.");
  }
}

const prompt = ai.definePrompt({
  name: 'generateLegalPetitionPrompt',
  input: { schema: GenerateLegalPetitionInputSchema },
  output: { schema: GenerateLegalPetitionOutputSchema },
  prompt: `Você é o Nelson, advogado previdenciário sênior. 
  Gere uma petição '{{{tipoPetição}}}' baseada no documento: {{media url=documentUri}}
  Fundamente com a legislação brasileira. Seja técnico e preciso.`,
});

const generateLegalPetitionFlow = ai.defineFlow(
  {
    name: 'generateLegalPetitionFlow',
    inputSchema: GenerateLegalPetitionInputSchema,
    outputSchema: GenerateLegalPetitionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error("A IA não conseguiu gerar a petição para este documento.");
    return output;
  }
);
