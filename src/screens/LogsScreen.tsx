/**
 * LogsScreen — port of `lib/screens/logs_screen.dart`. Streaming SSE log
 * viewer powered by `connectLogs` in `../audio/sse.ts`. Re-implements
 * filtering, search, reconnect, and per-level colour tokens.
 *
 * On mount: starts streaming. On unmount: closes connection. Retries honour
 * `isPaused` (the user can pause live streaming without losing what's on
 * screen).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { colors, fonts, fontWeights, radii, spacing } from '../config/theme';
import { useLogStore } from '../store/logStore';
import { connectLogs, SseHandle } from '../audio/sse';
import { copyToClipboard } from '../utils/clipboard';
import { levelColor, LogEntry } from '../types/log';
import { setSnackbarMessage } from '../components/Snackbar';

export const LogsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const logs = useLogStore((s) => s.logs);
  const isConnected = useLogStore((s) => s.isConnected);
  const isPaused = useLogStore((s) => s.isPaused);
  const autoScroll = useLogStore((s) => s.autoScroll);
  const filterLevel = useLogStore((s) => s.filterLevel);
  const searchQuery = useLogStore((s) => s.searchQuery);
  const addEntry = useLogStore((s) => s.addEntry);
  const setConnected = useLogStore((s) => s.setConnected);
  const togglePause = useLogStore((s) => s.togglePause);
  const toggleAutoScroll = useLogStore((s) => s.toggleAutoScroll);
  const setFilterLevel = useLogStore((s) => s.setFilterLevel);
  const setSearch = useLogStore((s) => s.setSearch);
  const clearLogs = useLogStore((s) => s.clearLogs);

  const sseRef = useRef<SseHandle | null>(null);
  const listRef = useRef<FlatList<LogEntry>>(null);
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return logs.filter((l) => {
      const matchesLevel = filterLevel === 'ALL' || l.level.toUpperCase() === filterLevel.toUpperCase();
      const matchesSearch = !q || l.message.toLowerCase().includes(q);
      return matchesLevel && matchesSearch;
    });
  }, [logs, filterLevel, searchQuery]);

  useEffect(() => {
    if (isPaused) {
      sseRef.current?.close();
      sseRef.current = null;
      setConnected(false);
      return;
    }
    sseRef.current = connectLogs({
      onEvent: (data) => addEntry(data),
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onError: () => setConnected(false),
      shouldReconnect: () => !isPaused,
    });
    return () => {
      sseRef.current?.close();
      sseRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && filtered.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [filtered.length, autoScroll]);

  async function copyLogs() {
    const text = filtered.map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
    await copyToClipboard(text);
    setSnackbarMessage(`Copied ${filtered.length} log entries`);
  }

  void showFilter; void setShowFilter; void navigation;
  void setFilterLevel;

  const statusColor = !isConnected ? colors.red : isPaused ? colors.gray : colors.green;
  const statusText = !isConnected ? 'Disconnected' : isPaused ? 'Paused' : 'Live';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={local.root}>
      <Header count={filtered.length} statusColor={statusColor} statusText={statusText} connected={isConnected} />
      <Toolbar
        q={searchQuery}
        onQ={setSearch}
        filter={filterLevel}
        onFilter={() => setShowFilter((v) => !v)}
        autoScroll={autoScroll}
        onToggleAutoScroll={toggleAutoScroll}
        onPause={togglePause}
        isPaused={isPaused}
        onCopy={copyLogs}
        onClear={clearLogs}
      />
      <Body listRef={listRef} filtered={filtered} isConnected={isConnected} totalLogsCount={logs.length} />
      <StatusBar total={logs.length} filteredCount={filtered.length} connected={isConnected} />
    </SafeAreaView>
  );
};

const Header: React.FC<{ count: number; statusColor: string; statusText: string; connected: boolean }> = ({ count, statusColor, statusText, connected }) => (
  <View style={local.header}>
    <View style={local.headerIconBox}>
      <MaterialIcons name="terminal" size={20} color={colors.text_primary} />
    </View>
    <View>
      <Text style={local.headerTitle}>System Logs</Text>
      <Text style={local.headerSub}>{count} entries • {statusText}</Text>
    </View>
    <View style={{ flex: 1 }} />
    <View style={[local.statusDot, { backgroundColor: statusColor }]} />
    <Text style={[local.statusText, { color: connected ? statusColor : colors.text_disabled }]}>{statusText.toUpperCase()}</Text>
  </View>
);

const Toolbar: React.FC<{
  q: string; onQ: (v: string) => void; filter: string; onFilter: () => void;
  autoScroll: boolean; onToggleAutoScroll: () => void; onPause: () => void; isPaused: boolean;
  onCopy: () => void; onClear: () => void;
}> = ({ q, onQ, filter, onFilter, autoScroll, onToggleAutoScroll, onPause, isPaused, onCopy, onClear }) => (
  <View style={local.toolbar}>
    <View style={local.searchBox}>
      <MaterialIcons name="search" size={18} color={colors.text_disabled} />
      <TextInput value={q} onChangeText={onQ} placeholder="Search logs..." placeholderTextColor={colors.text_disabled} style={local.searchInput} />
    </View>
    <Pressable style={local.toolbarBtn} onPress={onFilter}>
      <Text style={local.toolbarBtnText}>{filter}</Text>
      <MaterialIcons name="keyboard-arrow-down" size={18} color={colors.text_lowEmphasis} />
    </Pressable>
    <ToolbarIcon icon={autoScroll ? 'keyboard-arrow-down' : 'keyboard-arrow-up'} onPress={onToggleAutoScroll} active={autoScroll} />
    <ToolbarIcon icon="refresh" onPress={() => {}} />
    <ToolbarIcon icon={isPaused ? 'play-arrow' : 'pause'} onPress={onPause} active={!isPaused} />
    <ToolbarIcon icon="content-copy" onPress={onCopy} />
    <ToolbarIcon icon="clear-all" onPress={onClear} destructive />
  </View>
);

const ToolbarIcon: React.FC<{ icon: string; onPress: () => void; active?: boolean; destructive?: boolean }> = ({ icon, onPress, active, destructive }) => (
  <Pressable
    onPress={onPress}
    style={[local.toolbarBtn, active && { backgroundColor: colors.bgUserBubble, borderColor: colors.borderStrong }]}
    hitSlop={8}
  >
    <MaterialIcons name={icon as any} size={18} color={destructive ? colors.red : active ? colors.text_primary : colors.text_medEmphasis} />
  </Pressable>
);

const Body: React.FC<{ listRef: React.RefObject<FlatList<LogEntry> | null>; filtered: LogEntry[]; isConnected: boolean; totalLogsCount: number }> = ({ listRef, filtered, isConnected, totalLogsCount }) => {
  if (!isConnected && totalLogsCount === 0) {
    return (
      <View style={local.emptyCenter}>
        <MaterialIcons name="terminal" size={48} color={colors.text_faint} />
        <Text style={local.emptyTitle}>Connecting to log server...</Text>
        <Text style={local.emptyHint}>{'http://127.0.0.1:8000/read'}</Text>
      </View>
    );
  }
  if (filtered.length === 0) {
    return (
      <View style={local.emptyCenter}>
        <Text style={local.emptyTitle}>No logs available</Text>
        <Text style={local.emptyHint}>Server unreachable</Text>
      </View>
    );
  }
  return (
    <FlatList
      ref={listRef}
      data={filtered}
      keyExtractor={(item, idx) => `${idx}-${item.timestamp}`}
      renderItem={({ item }) => <LogRow entry={item} />}
      contentContainerStyle={{ padding: spacing.lg }}
    />
  );
};

const LogRow: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const c = levelColor(entry.level);
  return (
    <View style={local.logRow}>
      <Text style={local.logTime}>{entry.timestamp}</Text>
      <View style={[local.logDot, { backgroundColor: c }]} />
      <View style={[local.logBadge, { borderColor: c, backgroundColor: hex(c, 0.15) }]}>
        <Text style={[local.logBadgeText, { color: c }]}>{entry.level}</Text>
      </View>
      <Text style={local.logMsg} selectable>{entry.message}</Text>
    </View>
  );
};

function hex(c: string, alpha: number): string {
  if (c.startsWith('rgba')) return c;
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const StatusBar: React.FC<{ total: number; filteredCount: number; connected: boolean }> = ({ total, filteredCount, connected }) => (
  <View style={local.statusBar}>
    <Text style={local.statusBarLabel}>E.L.Y.S.I.U.M Logs • /read</Text>
    <View style={{ flex: 1 }} />
    <Text style={local.statusBarItem}>Total: {total}</Text>
    <Text style={local.statusBarItem}>Filtered: {filteredCount}</Text>
    <Text style={local.statusBarItem}>Stream: {connected ? 'Connected' : 'Disconnected'}</Text>
  </View>
);

const local = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' } as ViewStyle,
  header: {
    height: 64, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24,
    backgroundColor: colors.bgPrimary, borderBottomWidth: 1, borderBottomColor: colors.borderFaint,
  } as ViewStyle,
  headerIconBox: {
    padding: 8, backgroundColor: colors.bgSurfaceContainerHighest,
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderMed,
    marginRight: spacing.lg,
  } as ViewStyle,
  headerTitle: {
    color: colors.text_primary, fontFamily: fonts.display, fontSize: 18,
    fontWeight: fontWeights.semibold, letterSpacing: 0.5,
  },
  headerSub: { color: 'rgba(255,255,255,0.54)', fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 } as ViewStyle,
  statusText: { color: colors.text_disabled, fontSize: 11, fontWeight: fontWeights.semibold, letterSpacing: 0.5 },
  toolbar: {
    height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    backgroundColor: colors.bgPrimary, borderBottomWidth: 1, borderBottomColor: colors.borderFaint,
  } as ViewStyle,
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderColor: colors.borderMed, borderWidth: 1, borderRadius: radii.md,
    paddingHorizontal: 8, backgroundColor: colors.bgSurfaceVariant, height: 40,
  } as ViewStyle,
  searchInput: { flex: 1, color: colors.text_primary, fontFamily: fonts.body, fontSize: 13, marginLeft: 8, paddingTop: 0, paddingBottom: 0 },
  toolbarBtn: {
    marginLeft: 8, height: 40, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center',
    borderRadius: radii.md, backgroundColor: colors.bgSurfaceVariant, borderWidth: 1, borderColor: colors.borderMed,
    flexDirection: 'row',
  } as ViewStyle,
  toolbarBtnText: { color: colors.text_primary, marginRight: 4, fontSize: 13, fontFamily: fonts.body },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  emptyTitle: { marginTop: 24, color: 'rgba(255,255,255,0.54)', fontSize: 18, fontFamily: fonts.display, fontWeight: fontWeights.medium },
  emptyHint: { marginTop: 8, color: 'rgba(255,255,255,0.24)', fontSize: 11, fontFamily: fonts.mono },
  logRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, marginBottom: 4, borderRadius: 6 } as ViewStyle,
  logTime: { color: 'rgba(255,255,255,0.38)', fontSize: 11, fontFamily: fonts.mono, marginRight: 12 },
  logDot: { width: 6, height: 6, marginTop: 5, borderRadius: 3, marginRight: 10 } as ViewStyle,
  logBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, marginRight: 12 } as ViewStyle,
  logBadgeText: { fontSize: 10, fontFamily: fonts.mono, fontWeight: fontWeights.semibold, letterSpacing: 0.5 },
  logMsg: { flex: 1, color: colors.text_primary, fontFamily: fonts.mono, fontSize: 12, lineHeight: 18 },
  statusBar: { height: 32, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: colors.borderFaint } as ViewStyle,
  statusBarLabel: { color: 'rgba(255,255,255,0.24)', fontFamily: fonts.mono, fontSize: 10 },
  statusBarItem: { color: 'rgba(255,255,255,0.38)', fontFamily: fonts.mono, fontSize: 10, marginLeft: 24 },
});
