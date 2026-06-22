import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI()
  ],
  // O formato canônico para o plugin googleAI no Genkit é 'googleai/gemini-1.5-flash'
  model: 'googleai/gemini-1.5-flash',
});
