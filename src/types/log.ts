/**
 * LogEntry — direct port of `lib/screens/logs_screen.dart` `LogEntry` class.
 * Includes level parsing, timestamp parsing, levelColor mapping.
 */
import { colors } from '../config/theme';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'WARN' | 'ERROR' | 'CRITICAL' | 'FATAL' | string;

export interface LogEntry {
  timestamp: string; // HH:MM:SS or HH:MM:SS.mmm
  level: string;
  message: string;
}

const LEVEL_RE = /^(DEBUG|INFO|WARNING|WARN|ERROR|CRITICAL|FATAL)/;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function parseTimestamp(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function parseLevel(line: string): string {
  const m = LEVEL_RE.exec(line);
  return m ? m[1] : 'INFO';
}

export function fromLine(line: string): LogEntry {
  return {
    timestamp: parseTimestamp(),
    level: parseLevel(line),
    message: line,
  };
}

const TIMESTAMP_LINE_RE = /\|\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2},\d{3})\s*\|\s*(\w+)\s*\|\s*(.*)/;
const UVICORN_RE = /^(\w+):\s+(.*)/;

export function fromTimestampLine(line: string): LogEntry {
  const m = TIMESTAMP_LINE_RE.exec(line);
  if (m) {
    const lvl = m[2];
    const msg = m[3].trim();
    const time = m[1].substring(11, 19).replace(',', '.');
    return { timestamp: time, level: lvl, message: msg };
  }
  const um = UVICORN_RE.exec(line);
  if (um) {
    return { timestamp: parseTimestamp(), level: um[1], message: um[2].trim() };
  }
  return fromLine(line);
}

export function levelColor(level: string): string {
  switch (level.toUpperCase()) {
    case 'ERROR':
    case 'CRITICAL':
    case 'FATAL':
      return colors.red;
    case 'WARNING':
    case 'WARN':
      return colors.amber;
    case 'DEBUG':
      return colors.gray;
    case 'INFO':
    default:
      return colors.green;
  }
}

export const LOG_LEVELS = ['ALL', 'INFO', 'WARNING', 'ERROR', 'DEBUG', 'CRITICAL'] as const;
