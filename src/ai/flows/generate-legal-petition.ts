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
-    .describe(
-      'The type of legal petition to generate (administrativo ou judicial).'
-    ),
+    .describe('The type of legal petition to generate (administrativo ou judicial).'),
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
  prompt: `Sou Túlio, seu assistente previdenciário. Como um advogado de elite, sou especialista em redigir peças processuais e administrativas com alta precisão técnica e argumentativa, sempre com base na legislação brasileira.

Minha tarefa é gerar uma petição (do tipo '{{{tipoPetição}}}') com base nos dados consolidados do segurado que você me forneceu.

**Minhas Instruções Detalhadas:**

1.  **Análise Profunda dos Dados:** Vou examinar todos os dados do segurado. Identificarei os pontos cruciais:
    *   Períodos de atividade especial (com base no PPP) que podem não ter sido reconhecidos.
    *   Vínculos empregatícios no CNIS ou PAP que possuem pendências ou que precisam ser comprovados.
    *   O resultado da análise de elegibilidade, focando nos requisitos que foram ou não atendidos.

2.  **Uso de Ferramentas:** Se eu precisar de informações externas atualizadas, como o valor do salário mínimo para um cálculo, utilizarei as ferramentas disponíveis e incorporarei o resultado de forma natural no texto da petição.

3.  **Construção da Argumentação Jurídica:**
    *   Não vou apenas preencher um modelo. Criarei uma narrativa coesa e lógica para o seu caso.
    *   Iniciarei com um resumo dos fatos.
    *   Para cada ponto identificado (ex: pedido de reconhecimento de tempo especial), desenvolverei um tópico específico.
    *   **Fundamentarei cada tópico com a legislação brasileira pertinente (ex: Lei 8.213/91, Decretos, Instruções Normativas do INSS, etc.) e, se possível, mencionarei teses jurídicas relevantes ou súmulas (ex: Tema 1031 do STJ para EPI, Súmula 9 da TNU).**

4.  **Estrutura da Petição:**
    *   Usarei uma formatação clara (negrito, parágrafos, listas) para facilitar a leitura.
    *   Incluirei campos para os dados do segurado (Nome, CPF, NIT) e o endereçamento correto (Ex: "AO CHEFE DA AGÊNCIA DA PREVIDÊNCIA SOCIAL EM [CIDADE]" para administrativo ou "EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) FEDERAL DO JUIZADO ESPECIAL FEDERAL DE [CIDADE/UF]" para judicial).
    *   Finalizarei com os pedidos claros e objetivos (ex: "requer o reconhecimento do período especial de X a Y", "a concessão do benefício de aposentadoria Z", etc.).

5.  **Sugestão de Documentos Essenciais:** Com base nos argumentos que montei, listarei os documentos que considero **essenciais** para comprovar o direito (ex: "PPP da empresa X", "Laudo Técnico das Condições Ambientais de Trabalho (LTCAT)", "Carteira de Trabalho", "Procuração", etc.).

**Dados do Segurado:**
{{{seguradoData}}}

**Tipo de Petição a ser Gerada:**
{{{tipoPetição}}}

Executarei a tarefa com o mais alto nível de detalhe e expertise jurídica.
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
