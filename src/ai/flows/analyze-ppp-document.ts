'use server';

/**
 * @fileOverview An AI agent for analyzing PPP (Perfil Profissiográfico Previdenciário) documents.
 *
 * - analyzePppDocument - A function that handles the PPP analysis process.
 * - AnalyzePppDocumentInput - The input type for the analyzePppDocument function.
 * - AnalyzePppDocumentOutput - The return type for the analyzePppDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePppDocumentInputSchema = z.object({
  pppDocumentUri: z
    .string()
    .describe(
      "A PPP document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePppDocumentInput = z.infer<typeof AnalyzePppDocumentInputSchema>;

const ExposureRecordSchema = z.object({
  periodo: z.string().describe('Período da exposição (ex: DD/MM/AAAA a DD/MM/AAAA).'),
  fatorDeRisco: z.string().describe('Agente ou fator de risco (ex: Ruído, Sílica).'),
  intensidade: z.string().describe('Intensidade ou concentração do agente (ex: 85 dB, 1.5 mg/m³).'),
  tecnicaUtilizada: z.string().describe('Técnica utilizada para medição.'),
  epcEficaz: z.string().describe('Indicação se o EPC (Equipamento de Proteção Coletiva) era eficaz (Sim/Não).'),
  epiEficaz: z.string().describe('Indicação se o EPI (Equipamento de Proteção Individual) era eficaz (Sim/Não).'),
});

const AnalyzePppDocumentOutputSchema = z.object({
  nomeTrabalhador: z.string().describe("Nome do trabalhador."),
  empregador: z.string().describe("Nome do empregador (empresa)."),
  resumoGeral: z.string().describe("Um resumo geral e conclusivo sobre a exposição do trabalhador a agentes nocivos, destacando os períodos mais críticos e os principais riscos."),
  registrosExposicao: z.array(ExposureRecordSchema).describe('Uma lista detalhada dos registros de exposição a agentes nocivos encontrados no documento.'),
});
export type AnalyzePppDocumentOutput = z.infer<typeof AnalyzePppDocumentOutputSchema>;


export async function analyzePppDocument(input: AnalyzePppDocumentInput): Promise<AnalyzePppDocumentOutput> {
  return analyzePppDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePppDocumentPrompt',
  input: {schema: AnalyzePppDocumentInputSchema},
  output: {schema: AnalyzePppDocumentOutputSchema},
  prompt: `Olá! Sou o Nelson, seu assistente previdenciário. Sou especialista em saúde e segurança do trabalho com foco em direito previdenciário. Minha tarefa é analisar um documento PPP (Perfil Profissiográfico Previdenciário) e extrair as informações mais críticas para você.

Vamos analisar o documento que você enviou: {{media url=pppDocumentUri}}

Vou extrair os seguintes dados e estruturá-los para você:
1.  **nomeTrabalhador**: O nome completo do trabalhador.
2.  **empregador**: O nome da empresa/empregador.
3.  **resumoGeral**: Elaborarei um parágrafo de resumo, como um parecer, explicando as condições gerais de trabalho, os principais agentes nocivos a que o trabalhador foi exposto e se as medidas de proteção (EPC/EPI) foram consistentemente eficazes.
4.  **registrosExposicao**: Uma lista detalhada de todos os registros de exposição a agentes nocivos. Para cada um, vou extrair:
    - **periodo**: A data de início e fim da exposição.
    - **fatorDeRisco**: O nome do agente nocivo (físico, químico, biológico, etc.).
    - **intensidade**: A intensidade ou concentração registrada.
    - **tecnicaUtilizada**: A técnica de medição.
    - **epcEficaz**: Se o EPC foi eficaz (Sim/Não).
    - **epiEficaz**: Se o EPI foi eficaz (Sim/Não).

Se alguma informação não estiver clara no documento, indicarei como "Não informado". Farei o meu melhor para garantir que a saída seja precisa e fácil de entender.`,
});

const analyzePppDocumentFlow = ai.defineFlow(
  {
    name: 'analyzePppDocumentFlow',
    inputSchema: AnalyzePppDocumentInputSchema,
    outputSchema: AnalyzePppDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
