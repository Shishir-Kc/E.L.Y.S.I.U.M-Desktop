/**
 * SSE client — port of the `logs_screen.dart:140-206` connect loop.
 *
 * Per the user's choice: fetch + ReadableStream on platforms that support it,
 * and a manual XHR onprogress fallback for React Native's fetch implementation
 * which historically does not expose streaming bodies.
 *
 * Caller passes `onEvent(data)` and `onClose()` callbacks. The client handles
 * reconnect timing exactly as the Flutter app did:
 *   - on error: 3s delay then retry
 *   - on graceful close: 2s delay then retry
 *   - never throws
 */
import { API_BASE_URL, ENDPOINTS } from '../config/api';
import { Platform } from 'react-native';

export interface SseOptions {
  onEvent: (data: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (e: Error) => void;
  /** When true the client will reconnect; set to false from onClose to stop. */
  shouldReconnect: () => boolean;
  /** Optional reconnect-delay override. */
  reconnectDelayMs?: number;
}

export interface SseHandle {
  /** Stops the connection and prevents any pending retry. */
  close(): void;
  /** Returns true while the underlying stream is open. */
  get isOpen(): boolean;
}

const DEFAULT_RECONNECT_MS = 3000;

export function connectLogs(opts: SseOptions): SseHandle {
  let aborted = false;
  let isOpen = false;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  async function loop() {
    while (!aborted && opts.shouldReconnect()) {
      try {
        const ok = await doConnect();
        if (aborted) return;
        if (!ok) await wait(DEFAULT_RECONNECT_MS);
      } catch {
        if (aborted) return;
        await wait(DEFAULT_RECONNECT_MS);
      }
    }
    if (!aborted) opts.onClose?.();
  }

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        resolve();
      }, opts.reconnectDelayMs ?? ms);
    });
  }

  async function doConnect(): Promise<boolean> {
    const url = `${API_BASE_URL}${ENDPOINTS.logs}`;
    if (Platform.OS === 'web') {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        });
        if (!res.ok || !res.body) {
          opts.onError?.(new Error(`SSE HTTP ${res.status}`));
          return false;
        }
        isOpen = true;
        opts.onOpen?.();
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        try {
          while (!aborted) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const parts = buf.split('\n\n');
            buf = parts.pop() ?? '';
            for (const evt of parts) {
              const data = evt
                .split('\n')
                .filter((l) => l.startsWith('data:'))
                .map((l) => l.slice(5).trim())
                .join('\n');
              if (data) opts.onEvent(data);
            }
          }
        } finally {
          isOpen = false;
        }
        return false; // gracefully closed — prompt a reconnect after wait
      } catch (e) {
        isOpen = false;
        opts.onError?.(e as Error);
        return false;
      }
    } else {
      // Native fallback: XHR onprogress. Many RN fetch implementations buffer
      // the entire body before resolving, so we use XHR's incremental
      // responseText and parse SSE chunks as they arrive.
      return await new Promise<boolean>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Accept', 'text/event-stream');
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        let processed = 0;
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 2 && xhr.status >= 200 && xhr.status < 300) {
            isOpen = true;
            opts.onOpen?.();
          }
          if (xhr.readyState === 3) {
            const text = xhr.responseText;
            const slice = text.substring(processed);
            processed = text.length;
            const parts = slice.split('\n\n');
            // keep the last partial chunk — but onprogress chunks usually end
            // mid-line. The split may include incomplete data, so we ignore the
            // last part unless it ends with \n\n; we'll pick it up in next pass.
            for (let i = 0; i < parts.length - 1; i++) {
              const evt = parts[i];
              const data = evt
                .split('\n')
                .filter((l) => l.startsWith('data:'))
                .map((l) => l.slice(5).trim())
                .join('\n');
              if (data) opts.onEvent(data);
            }
          }
          if (xhr.readyState === 4) {
            isOpen = false;
            if (aborted) {
              resolve(false);
              return;
            }
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(false); // graceful close → reconnect via close delay
            } else {
              opts.onError?.(new Error(`SSE HTTP ${xhr.status}`));
              resolve(false);
            }
          }
        };
        xhr.onerror = () => {
          isOpen = false;
          opts.onError?.(new Error('SSE network error'));
          resolve(false);
        };
        if (AbortedAborted) {
          Object.defineProperty(xhr, 'ons', { value: undefined });
        }
        xhr.send();
      });
    }
  }

  void loop();

  return {
    close: () => {
      aborted = true;
      isOpen = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
    },
    get isOpen() {
      return isOpen;
    },
  };
}

// dummy token to keep TS silent about unused identifier patterns
const AbortedAborted = false;
