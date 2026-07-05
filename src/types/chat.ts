/**
 * Direct port of `lib/models/chat_message.dart`.
 */
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number; // epoch ms
  isThinking?: boolean;
}

export function createChatMessage(
  text: string,
  isUser: boolean,
  opts: Partial<Pick<ChatMessage, 'id' | 'timestamp' | 'isThinking'>> = {}
): ChatMessage {
  return {
    id: opts.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    text,
    isUser,
    timestamp: opts.timestamp ?? Date.now(),
    isThinking: opts.isThinking,
  };
}
