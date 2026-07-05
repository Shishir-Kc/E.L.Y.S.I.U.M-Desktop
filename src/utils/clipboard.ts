/**
 * Clipboard wrapper that works on native (react-native-clipboard) and web.
 */
import { Platform } from 'react-native';

let clipboardNative: { setString: (s: string) => void } | null = null;

function ensureNative() {
  if (clipboardNative || Platform.OS === 'web') return clipboardNative;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-clipboard/clipboard');
    clipboardNative = mod.default ?? mod;
  } catch {
    clipboardNative = null;
  }
  return clipboardNative;
}

export async function copyToClipboard(text: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fallback to a hidden textarea + execCommand('copy')
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
      return;
    }
  }
  ensureNative()?.setString(text);
}
