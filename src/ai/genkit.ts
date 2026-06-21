import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI()
  ],
  // No plugin googleAI do Genkit, o modelo deve ser referenciado apenas pelo nome
  model: 'gemini-1.5-flash',
});
