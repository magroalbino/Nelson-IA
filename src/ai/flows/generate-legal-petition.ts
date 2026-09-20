'use server';

import { z } from 'zod';

const GenerateLegalPetitionInputSchema = z.object({
  documentUri: z.string().min(1),
  tipoPetição: z.string().min(1),
});

const GenerateLegalPetitionOutputSchema = z.object({
  peticao: z.string().min(1),
  documentosAnexos: z.string(),
});

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
};

function parseDataUri(documentUri: string): { mimeType: string; data: string } {
  const match = documentUri.match(/^data:([^;,]+);base64,([\s\S]+)$/);
  if (!match) throw new Error('Documento em formato inválido. Reenvie o arquivo em PDF ou Word.');
  return { mimeType: match[1], data: match[2] };
}

function parseJsonResponse(text: string): unknown {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('A IA retornou uma petição em formato inválido. Tente novamente.');
  }
}

async function requestGemini(model: string, apiKey: string, payload: string): Promise<Response> {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
}

export async function generateLegalPetition(input: { documentUri: string; tipoPetição: string }) {
  const validated = GenerateLegalPetitionInputSchema.parse(input);
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) throw new Error('A variável GOOGLE_GENAI_API_KEY não está configurada no servidor.');

  const { mimeType, data } = parseDataUri(validated.documentUri);
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite';
  const prompt = `Você é um assistente de redação jurídica previdenciária. Analise o documento anexado e prepare uma minuta de ${validated.tipoPetição === 'judicial' ? 'petição inicial judicial para a Justiça Federal' : 'requerimento administrativo dirigido ao INSS'}.

Regras obrigatórias:
- Retorne SOMENTE JSON válido, sem markdown, com as chaves "peticao" e "documentosAnexos".
- Não invente nomes, datas, números, vínculos, benefícios, leis aplicáveis a fatos não identificados ou provas que não estejam no documento.
- Quando faltar informação, use [INFORMAÇÃO NÃO IDENTIFICADA] e liste a pendência em documentosAnexos.
- A petição é uma minuta informativa e deve ser revisada por profissional habilitado antes de qualquer protocolo.
- Use linguagem técnica, clara e organizada, com fatos, fundamentos possíveis, pedidos e lista de documentos.
`;
  const payload = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType, data } }] }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  });

  let lastStatus = 0;
  let response: Response | undefined;
  for (const candidate of [...new Set([model, fallbackModel])]) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      response = await requestGemini(candidate, apiKey, payload);
      if (response.ok) break;
      lastStatus = response.status;
      const details = await response.text();
      console.error(`[PETIÇÃO] modelo=${candidate} tentativa=${attempt + 1} HTTP ${response.status}:`, details);
      if (![429, 500, 502, 503, 504].includes(response.status)) break;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 700));
    }
    if (response?.ok) break;
  }

  if (!response?.ok) {
    if (lastStatus === 429) throw new Error('A API Gemini atingiu o limite temporário de solicitações. Aguarde e tente novamente.');
    if ([500, 502, 503, 504].includes(lastStatus)) throw new Error('A API Gemini está temporariamente indisponível. Tente novamente em alguns segundos.');
    throw new Error(`A API Gemini respondeu com HTTP ${lastStatus}. Verifique o modelo configurado e a chave da API.`);
  }

  const body = await response.json() as GeminiResponse;
  const raw = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('A IA não retornou uma petição.');
  return GenerateLegalPetitionOutputSchema.parse(parseJsonResponse(raw));
}
