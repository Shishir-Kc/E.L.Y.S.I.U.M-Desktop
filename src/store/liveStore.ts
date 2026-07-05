/**
 * Live conversation store — mirrors `_LiveConversationScreenState` in
 * `lib/screens/live_conversation_screen.dart`.
 * Holds: isListening / isProcessing / isPlaying.
 */
import { create } from 'zustand';

interface LiveState {
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  setListening: (v: boolean) => void;
  setProcessing: (v: boolean) => void;
  setPlaying: (v: boolean) => void;
}

export const useLiveStore = create<LiveState>((set) => ({
  isListening: false,
  isProcessing: false,
  isPlaying: false,
  setListening: (v) => set({ isListening: v }),
  setProcessing: (v) => set({ isProcessing: v }),
  setPlaying: (v) => set({ isPlaying: v }),
}));
