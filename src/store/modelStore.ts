/**
 * Currently-selected model wrapper (chatStore already holds the canonical
 * selectedModel; this store exists as a tiny convenience for components that
 * only care about model identity rather than the full chat state).
 */
import { create } from 'zustand';
import { ModelId } from '../config/models';

interface ModelState {
  selectedModel: ModelId;
  set: (id: ModelId) => void;
}

export const useModelStore = create<ModelState>((set) => ({
  selectedModel: 'krypton',
  set: (id) => set({ selectedModel: id }),
}));
