'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const getSalarioMinimoAtual = ai.defineTool(
  {
    name: 'getSalarioMinimoAtual',
    description: 'Obtém o valor atual do salário mínimo nacional no Brasil.',
    inputSchema: z.object({}),
    outputSchema: z.object({
        valor: z.number(),
        vigencia: z.string()
    }),
  },
  async () => {
    return { valor: 1412.00, vigencia: "2024" };
  }
)

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
  try {
    const result = await generateLegalPetitionFlow(input);
    console.log("[PETIÇÃO] Geração concluída.");
    return result;
  } catch (error) {
    console.error("[PETIÇÃO] Erro fatal no flow:", error);
    throw error;
  }
}

const prompt = ai.definePrompt({
  name: 'generateLegalPetitionPrompt',
  tools: [getSalarioMinimoAtual],
  input: { schema: GenerateLegalPetitionInputSchema },
  output: { schema: GenerateLegalPetitionOutputSchema },
  prompt: `Você é o Nelson, advogado previdenciário sênior. Gere uma petição do tipo '{{{tipoPetição}}}' baseada no documento: {{media url=documentUri}}
Fundamente com a legislação brasileira (Lei 8.213/91, etc.). Forneça a petição e sugestões de anexos.`,
});

const generateLegalPetitionFlow = ai.defineFlow(
  {
    name: 'generateLegalPetitionFlow',
    inputSchema: GenerateLegalPetitionInputSchema,
    outputSchema: GenerateLegalPetitionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error("A IA não retornou um resultado válido.");
    return output;
  }
);
