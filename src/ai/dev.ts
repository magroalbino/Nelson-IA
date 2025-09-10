import { config } from 'dotenv';
config();

import '@/ai/flows/extract-pap-data.ts';
import '@/ai/flows/generate-legal-petition.ts';
import '@/ai/flows/analyze-ppp-document.ts';
import '@/ai/flows/analyze-retirement-eligibility.ts';
import '@/ai/flows/analyze-cnis-pendencies.ts';
