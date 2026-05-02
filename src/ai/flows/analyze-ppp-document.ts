'use server';

/**
 * @fileOverview An AI agent for analyzing PPP (Perfil Profissiográfico Previdenciário) documents with special retirement eligibility assessment.
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
  elegibilidadeEspecial: z.object({
    isElegivel: z.boolean().describe("Whether the worker is eligible for special retirement (aposentadoria especial)."),
    agentesNocivos: z.array(z.string()).describe("List of harmful agents identified."),
    tempoEspecialEstimado: z.string().describe("Estimated special contribution time (if eligible)."),
    percentualConversao: z.number().describe("Conversion percentage for special time to common time (e.g., 1.4 for 40% bonus).")
  }).describe("Assessment of eligibility for special retirement."),
  riskAssessment: z.object({
    riskLevel: z.string().describe("Overall risk level: 'baixo', 'medio', or 'alto'."),
    mainHazards: z.array(z.string()).describe("List of main hazards identified."),
    protectionEffectiveness: z.number().min(0).max(100).describe("Overall effectiveness of protection measures (EPC/EPI) as a percentage.")
  }).describe("Risk assessment based on exposure records."),
  registrosExposicao: z.array(ExposureRecordSchema).describe('Uma lista detalhada dos registros de exposição a agentes nocivos encontrados no documento.'),
  recommendations: z.array(z.string()).describe('A list of recommendations based on the PPP analysis.')
});
export type AnalyzePppDocumentOutput = z.infer<typeof AnalyzePppDocumentOutputSchema>;


export async function analyzePppDocument(input: AnalyzePppDocumentInput): Promise<AnalyzePppDocumentOutput> {
  return analyzePppDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePppDocumentPrompt',
  input: {schema: AnalyzePppDocumentInputSchema},
  output: {schema: AnalyzePppDocumentOutputSchema},
  prompt: `Olá! Sou o Nelson, seu assistente previdenciário. Sou especialista em saúde e segurança do trabalho com foco em direito previdenciário. Minha tarefa é analisar um documento PPP (Perfil Profissiográfico Previdenciário) e extrair as informações mais críticas para você, incluindo uma avaliação de elegibilidade para aposentadoria especial.

Vamos analisar o documento que você enviou: {{media url=pppDocumentUri}}

Vou extrair os seguintes dados e estruturá-los para você:

1. **nomeTrabalhador**: O nome completo do trabalhador.
2. **empregador**: O nome da empresa/empregador.
3. **resumoGeral**: Elaborarei um parágrafo de resumo, como um parecer, explicando as condições gerais de trabalho, os principais agentes nocivos a que o trabalhador foi exposto e se as medidas de proteção (EPC/EPI) foram consistentemente eficazes.
4. **elegibilidadeEspecial**: Uma análise completa sobre elegibilidade para aposentadoria especial:
   - **isElegivel**: Se o trabalhador é elegível para aposentadoria especial (baseado em exposição comprovada a agentes nocivos).
   - **agentesNocivos**: Lista dos agentes nocivos identificados.
   - **tempoEspecialEstimado**: Tempo especial estimado (se elegível).
   - **percentualConversao**: Percentual de conversão do tempo especial (ex: 1.4 = 40% de bônus).
5. **riskAssessment**: Avaliação de risco:
   - **riskLevel**: Nível geral de risco (baixo, médio, alto).
   - **mainHazards**: Principais riscos identificados.
   - **protectionEffectiveness**: Efetividade das medidas de proteção (0-100%).
6. **registrosExposicao**: Uma lista detalhada de todos os registros de exposição a agentes nocivos. Para cada um, vou extrair:
   - **periodo**: A data de início e fim da exposição.
   - **fatorDeRisco**: O nome do agente nocivo (físico, químico, biológico, etc.).
   - **intensidade**: A intensidade ou concentração registrada.
   - **tecnicaUtilizada**: A técnica de medição.
   - **epcEficaz**: Se o EPC foi eficaz (Sim/Não).
   - **epiEficaz**: Se o EPI foi eficaz (Sim/Não).
7. **recommendations**: Recomendações práticas baseadas na análise (ex: documentação adicional necessária, próximos passos para requerer aposentadoria especial).

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
