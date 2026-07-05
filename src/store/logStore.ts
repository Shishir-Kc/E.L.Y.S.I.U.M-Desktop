/**
 * Log SSE store — port of `_LogsScreenState` from `lib/screens/logs_screen.dart`.
 * Holds: logs list, filter level, search, pause, connection state.
 * Streaming connection handled by ../audio/sse.client.ts which calls
 * `addEntry`.
 */
import { create } from 'zustand';
import { LogEntry, fromTimestampLine, LOG_LEVELS } from '../types/log';

interface LogState {
  logs: LogEntry[];
  isConnected: boolean;
  isPaused: boolean;
  autoScroll: boolean;
  filterLevel: string; // 'ALL' | one of LOG_LEVELS
  searchQuery: string;

  // actions
  addEntry: (raw: string) => void;
  setConnected: (v: boolean) => void;
  togglePause: () => void;
  setPaused: (v: boolean) => void;
  toggleAutoScroll: () => void;
  setFilterLevel: (lvl: string) => void;
  setSearch: (q: string) => void;
  clearLogs: () => void;

  // derived
  filteredLogs: () => LogEntry[];
}

let nextIdCounter = 0;
function nextId(): number {
  return ++nextIdCounter;
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  isConnected: false,
  isPaused: false,
  autoScroll: true,
  filterLevel: 'ALL',
  searchQuery: '',

  addEntry: (raw) => {
    const entry = fromTimestampLine(raw);
    // cap retained logs to 5000 to prevent memory bloat
    set((s) => {
      const next = [...s.logs, entry];
      if (next.length > 5000) next.splice(0, next.length - 5000);
      return { logs: next };
    });
    void nextId;
  },

  setConnected: (v) => set({ isConnected: v }),
  togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
  setPaused: (v) => set({ isPaused: v }),
  toggleAutoScroll: () => set((s) => ({ autoScroll: !s.autoScroll })),
  setFilterLevel: (lvl) => set({ filterLevel: lvl }),
  setSearch: (q) => set({ searchQuery: q }),
  clearLogs: () => set({ logs: [] }),

  filteredLogs: () => {
    const { logs, filterLevel, searchQuery } = get();
    const q = searchQuery.toLowerCase();
    return logs.filter((l) => {
      const matchesLevel =
        filterLevel === 'ALL' ||
        l.level.toUpperCase() === (filterLevel as string).toUpperCase();
      const matchesSearch = !q || l.message.toLowerCase().includes(q);
      return matchesLevel && matchesSearch;
    });
  },
}));

export type { LogEntry };
export { LOG_LEVELS };
