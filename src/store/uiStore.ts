/**
 * UI-only state that doesn't belong to a specific domain store:
 * sidebar expanded/collapsed, current screen, and copy-toast visibility.
 */
import { create } from 'zustand';

export type SidebarItemId = 'chats' | 'memory' | 'agents' | 'code' | 'logs' | 'updates' | 'workers' | 'email' | 'settings';

interface UIState {
  sidebarExpanded: boolean;
  selectedSidebarItem: SidebarItemId;
  showCopyToast: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (v: boolean) => void;
  selectItem: (id: SidebarItemId) => void;
  flashCopyToast: () => void;
  hideCopyToast: () => void;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useUIStore = create<UIState>((set) => ({
  sidebarExpanded: false,
  selectedSidebarItem: 'chats',
  showCopyToast: false,
  toggleSidebar: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
  setSidebarExpanded: (v) => set({ sidebarExpanded: v }),
  selectItem: (id) => set({ selectedSidebarItem: id }),
  flashCopyToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ showCopyToast: true });
    toastTimer = setTimeout(() => set({ showCopyToast: false }), 2000);
  },
  hideCopyToast: () => set({ showCopyToast: false }),
}));
