import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// O Genkit por padrão procura por GOOGLE_GENAI_API_KEY ou GOOGLE_API_KEY
// Esta configuração garante que o plugin seja inicializado corretamente
export const ai = genkit({
  plugins: [
    googleAI()
  ],
  model: 'googleai/gemini-1.5-flash',
});
