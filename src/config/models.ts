/**
 * Available AI models + helper functions.
 * Direct port of `lib/widgets/model_selector_modal.dart` (kModels + modelDisplayName).
 * Adds a `groq` endpoint branch that was missing in the Flutter _fetchResponse.
 */
import { ENDPOINTS } from './api';

export type ModelId =
  | 'krypton'
  | 'chatGpt'
  | 'gemini'
  | 'groq'
  | 'krypton_agent';

export interface ModelDescriptor {
  id: ModelId;
  name: string;
  description: string;
}

export const MODELS: ModelDescriptor[] = [
  { id: 'krypton',         name: 'E.L.Y.S.I.U.M',             description: 'High-performance default assistant' },
  { id: 'chatGpt',         name: 'ChatGPT',                   description: 'Advanced reasoning and general knowledge' },
  { id: 'gemini',          name: 'Gemini 3 Flash Preview',    description: 'Multimodal understanding and generation' },
  { id: 'groq',            name: 'Groq',                      description: 'Ultra-low latency fast inference' },
  { id: 'krypton_agent',   name: 'E.L.Y.S.I.U.M Agent',       description: 'Autonomous task execution with tools' },
];

export function modelDisplayName(id: string): string {
  const found = MODELS.find((m) => m.id === id);
  return found ? found.name : id;
}

export function endpointForModel(id: string): string {
  switch (id as ModelId) {
    case 'krypton_agent': return ENDPOINTS.chat.kryptonAgent;
    case 'chatGpt':       return ENDPOINTS.chat.gpt;
    case 'gemini':        return ENDPOINTS.chat.gemini;
    case 'groq':          return ENDPOINTS.chat.groq;
    case 'krypton':
    default:              return ENDPOINTS.chat.krypton;
  }
}
