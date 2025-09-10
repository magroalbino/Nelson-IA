import { config } from 'dotenv';
config();

import '@/ai/flows/extract-pap-data.ts';
import '@/ai/flows/generate-legal-petition.ts';
import '@/ai/flows/summarize-cnis-analysis.ts';
import '@/ai/flows/analyze-ppp-document.ts';
