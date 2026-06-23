import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI()
  ],
  // Usando a referência oficial exportada pelo plugin para garantir compatibilidade total
  model: gemini15Flash,
});
