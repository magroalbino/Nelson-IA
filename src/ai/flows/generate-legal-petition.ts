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

// Tool Definition: This is how we define a tool the AI can use.
// In a real scenario, this function would make a fetch() call to an external API.
const getSalarioMinimoAtual = ai.defineTool(
  {
    name: 'getSalarioMinimoAtual',
    description: 'Obtém o valor atual do salário mínimo nacional no Brasil. Útil para cálculos de valor de causa ou para pedidos de Benefício de Prestação Continuada (BPC).',
    inputSchema: z.object({}),
    outputSchema: z.object({
        valor: z.number().describe('O valor numérico do salário mínimo.'),
        vigencia: z.string().describe('O ano de vigência do valor, ex: "2024".')
    }),
  },
  async () => {
    // << Em um cenário real, aqui você faria a chamada para a API externa >>
    // Ex: const response = await fetch('https://api.dados.gov.br/...');
    // const data = await response.json();
    console.log('Ferramenta getSalarioMinimoAtual foi chamada pela IA!');
    return { valor: 1412.00, vigencia: "2024" };
  }
)


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
  // We make the tool available to the AI model here.
  tools: [getSalarioMinimoAtual],
  input: {
    schema: GenerateLegalPetitionInputSchema,
  },
  output: {
    schema: GenerateLegalPetitionOutputSchema,
  },
  prompt: `Você é um advogado previdenciarista de elite, especialista em redigir peças processuais e administrativas com alta precisão técnica e argumentativa.

Sua tarefa é gerar uma petição (do tipo '{{{tipoPetição}}}') com base nos dados consolidados do segurado.

**Instruções Detalhadas:**

1.  **Analise Profundamente os Dados:** Examine todos os dados do segurado fornecidos. Identifique os pontos cruciais:
    *   Períodos de atividade especial (com base no PPP) que podem não ter sido reconhecidos.
    *   Vínculos empregatícios no CNIS ou PAP que possuem pendências ou que precisam ser comprovados.
    *   O resultado da análise de elegibilidade, focando nos requisitos que foram ou não atendidos.

2.  **Use Ferramentas, se necessário:** Se precisar de informações externas atualizadas, como o valor do salário mínimo para um cálculo, utilize as ferramentas disponíveis. Incorpore o resultado da ferramenta de forma natural no texto da petição.

3.  **Construa a Argumentação Jurídica:**
    *   Não apenas preencha um modelo. Crie uma narrativa coesa e lógica.
    *   Inicie com um resumo dos fatos.
    *   Para cada ponto identificado (ex: pedido de reconhecimento de tempo especial), desenvolva um tópico específico na petição.
    *   Fundamente cada tópico com a legislação brasileira pertinente (ex: Lei 8.213/91, Decretos, etc.) e, se possível, mencione teses jurídicas relevantes (ex: Tema 1031 do STJ para EPI).

4.  **Estruture a Petição:**
    *   Use formatação clara (negrito, parágrafos, listas) para facilitar a leitura.
    *   Inclua campos para os dados do segurado (Nome, CPF, NIT) e o endereçamento correto (Ex: "AO CHEFE DA AGÊNCIA DA PREVIDÊNCIA SOCIAL EM [CIDADE]" para administrativo ou "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL DO JUIZADO ESPECIAL FEDERAL DE [CIDADE/UF]" para judicial).
    *   Finalize com os pedidos claros e objetivos (ex: "requer o reconhecimento do período especial de X a Y", "a concessão do benefício de aposentadoria Z", etc.).

5.  **Sugira Documentos Essenciais:** Com base nos argumentos que você montou, liste os documentos que são **essenciais** para comprovar o direito (ex: "PPP da empresa X", "Laudo Técnico das Condições Ambientais de Trabalho (LTCAT)", "Carteira de Trabalho", "Procuração", etc.).

**Dados do Segurado:**
{{{seguradoData}}}

**Tipo de Petição a ser Gerada:**
{{{tipoPetição}}}

Execute a tarefa com o mais alto nível de detalhe e expertise jurídica.
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
