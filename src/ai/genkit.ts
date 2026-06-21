import {genkit} from 'genkit';
import {googleAI, gemini15Flash} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI()
  ],
  // Usando a referência oficial do modelo exportada pelo plugin
  model: gemini15Flash,
});
