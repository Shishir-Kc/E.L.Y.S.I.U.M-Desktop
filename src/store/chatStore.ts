/**
 * Chat store — port of `_ChatScreenState` from `lib/screens/chat_screen.dart`.
 *
 * Holds: messages, typing flag, recording flag, selected model, current
 * greeting, transcribing flag. exposes actions: sendMessage, transcribe,
 * clearChat, setModel, setRecording, addBotMessage, _scrollToBottom is
 * handled by the ChatScreen component via a ref to the FlatList.
 */
import { create } from 'zustand';
import { ChatMessage, createChatMessage } from '../types/chat';
import { ModelId, endpointForModel, modelDisplayName } from '../config/models';
import { postChat, transcribeAudio, UploadHandle } from '../utils/request';

const GREETINGS = [
  "Hi, what are we planning today?",
  "Ready to build something amazing?",
  "What's on your mind?",
  "Let's solve some problems.",
  "Hello! How can I help you?",
  "E.L.Y.S.I.U.M is ready for you.",
  "What can I do for you today?",
];

function randomGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  selectedModel: ModelId;
  greeting: string;
  draftText: string;

  // actions
  setDraft: (t: string) => void;
  setRecording: (v: boolean) => void;
  setModel: (id: ModelId) => void;
  currentModelName: () => string;
  clearChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  addBotMessage: (text: string) => void;
  transcribe: (handle: UploadHandle) => Promise<string | null>;
  setTranscribing: (v: boolean) => void;
  setTranscribedText: (text: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,
  isRecording: false,
  isTranscribing: false,
  selectedModel: 'krypton',
  greeting: randomGreeting(),
  draftText: '',

  setDraft: (t) => set({ draftText: t }),
  setRecording: (v) => set({ isRecording: v }),
  setModel: (id) => set({ selectedModel: id }),
  currentModelName: () => modelDisplayName(get().selectedModel),

  clearChat: () =>
    set({
      messages: [],
      isTyping: false,
      greeting: randomGreeting(),
    }),

  sendMessage: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || get().isTyping) return;
    set({ draftText: '' });
    set((s) => ({
      messages: [...s.messages, createChatMessage(trimmed, true)],
      isTyping: true,
    }));
    try {
      const reply = await postChat(endpointForModel(get().selectedModel), trimmed);
      get().addBotMessage(reply);
    } catch (e) {
      const err = e as Error;
      get().addBotMessage(
        `Error: ${err.message || 'Could not connect to API. Is the server running?'}`
      );
    }
  },

  addBotMessage: (text: string) =>
    set((s) => ({
      messages: [...s.messages, createChatMessage(text, false)],
      isTyping: false,
    })),

  transcribe: async (handle: UploadHandle) => {
    set({ isTranscribing: true });
    try {
      const text = await transcribeAudio(handle);
      if (text) set({ draftText: text });
      return text;
    } finally {
      set({ isTranscribing: false });
    }
  },

  setTranscribing: (v) => set({ isTranscribing: v }),
  setTranscribedText: (text) => set({ draftText: text }),
}));
