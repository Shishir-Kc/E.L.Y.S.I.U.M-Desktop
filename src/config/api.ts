/**
 * Backend API configuration.
 *
 * The original Flutter app hardcoded `http://127.0.0.1:8000` everywhere.
 * On a physical Android device 127.0.0.1 refers to the device itself, not the
 * host machine, so we expose a single configurable base URL.
 *
 * Resolution order:
 *  1. process.env.API_BASE_URL  (set at build/runtime)
 *  2. window.__API_BASE_URL__   (web-only override, e.g. injected by index.html)
 *  3. Platform-specific default
 */
import { Platform } from 'react-native';

type PlatformOSType = typeof Platform.OS;

const ENV_URL =
  (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) ||
  (typeof window !== 'undefined' && (window as any).__API_BASE_URL__);

function defaultForPlatform(os: PlatformOSType): string {
  switch (os) {
    case 'android':
      // Android emulator maps 10.0.2.2 -> host loopback
      return 'http://10.0.2.2:8000';
    case 'web':
    default:
      return 'http://127.0.0.1:8000';
  }
}

export const API_BASE_URL: string = ENV_URL || defaultForPlatform(Platform.OS);

export const ENDPOINTS = {
  chat: {
    krypton: '/v1/chat/krypton/',
    kryptonAgent: '/v1/chat/krypton/agent/',
    gpt: '/v1/chat/gpt/',
    gemini: '/v1/chat/gemini/3/flash/preview/',
    groq: '/v1/chat/groq/',
  },
  transcribe: '/v1/transcribe/',
  live: '/v1/live/conv/',
  logs: '/read',
} as const;

export function urlFor(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}
