/**
 * Voice Activity Detection — verbatim port of `_processAudioChunk` and the
 * silence-timer logic from `lib/screens/live_conversation_screen.dart:79-103`.
 *
 * Same amplitude threshold (8000) and silence disconnect (1200ms) as the
 * Flutter app. Designed to be called from the audio engine for every captured
 * PCM chunk. Callbacks are used so the engine/UI can react (start/stop record)
 * without this module depending on stores or components.
 */
import { NativeTimer } from './timer';

export interface VadCallbacks {
  onSpeechStart?: () => void;
  onSilenceTimeout?: () => void;
}

export interface VadOptions {
  threshold?: number;
  silenceMs?: number;
}

const DEFAULT_THRESHOLD = 8000;
const DEFAULT_SILENCE_MS = 1200;

/**
 * Stateless amplitude processor. Given a chunk of S16_LE little-endian bytes,
 * computes `max(|sample|)`. Returns 0 for empty input. Identical to the Dart
 * implementation, including the signed-16 reconstruction from two bytes.
 *
 * Used both by the live conversation screen (silence detection) and by the
 * voice input widget (waveform height — see waveAmplitudeFromChunk).
 */
export function maxAmplitudeS16LE(data: Uint8Array): number {
  if (data.length < 2) return 0;
  let maxVal = 0;
  for (let i = 0; i < data.length - 1; i += 2) {
    const low = data[i];
    const high = data[i + 1];
    let sample = (high << 8) | low;
    if (sample > 32767) sample -= 65536;
    const abs = Math.abs(sample);
    if (abs > maxVal) maxVal = abs;
  }
  return maxVal;
}

/**
 * Voice-activity-detector with a 1.2s silence disconnect.
 *
 * Behaviour copied from `live_conversation_screen.dart:79-103`:
 *  - First loud sample (amplitude > threshold) sets `_hasSpeechStarted` and
 *    cancels any pending silence timer.
 *  - Once speech has started, a quiet sample starts the silence timer (if not
 *    already running). When that timer fires, `onSilenceTimeout` is invoked
 *    exactly once.
 *  - `reset()` clears speech-started flag and timer (call after stop).
 *
 * Also used by `VoiceInputWidget` to drive the waveform animation; for that
 * use case the caller should ignore the timer callbacks and instead poll
 * `waveAmplitudeFromChunk`.
 */
export class VoiceActivityDetector {
  private timer: NativeTimer | null = null;
  private hasSpeechStarted = false;
  private readonly threshold: number;
  private readonly silenceMs: number;
  private readonly cb: VadCallbacks;

  constructor(cb: VadCallbacks, opts: VadOptions = {}) {
    this.cb = cb;
    this.threshold = opts.threshold ?? DEFAULT_THRESHOLD;
    this.silenceMs = opts.silenceMs ?? DEFAULT_SILENCE_MS;
  }

  /**
   * Feed a chunk of S16_LE PCM bytes from the recorded audio stream.
   */
  processChunk(data: Uint8Array): void {
    const maxVal = maxAmplitudeS16LE(data);
    if (maxVal > this.threshold) {
      if (!this.hasSpeechStarted) this.cb.onSpeechStart?.();
      this.hasSpeechStarted = true;
      this.cancelTimer();
    } else if (this.hasSpeechStarted && this.timer === null) {
      this.timer = new NativeTimer(() => {
        this.timer = null;
        this.cb.onSilenceTimeout?.();
      }, this.silenceMs);
    }
  }

  reset(): void {
    this.cancelTimer();
    this.hasSpeechStarted = false;
  }

  private cancelTimer(): void {
    if (this.timer) {
      this.timer.cancel();
      this.timer = null;
    }
  }

  dispose(): void {
    this.cancelTimer();
  }
}

/**
 * Maps a S16_LE PCM chunk to a normalized 0..1 amplitude, used to drive the
 * VoiceInputWidget waveform bars. Mirrors `_processAudioChunk` in
 * `lib/widgets/voice_input_widget.dart:132-167` — including the 12000 /
 * clamp(0,1) / floor-of-0.05 boost.
 *
 * Returns a number in [0, 1] representing the current loudness of the chunk.
 */
export function waveAmplitudeFromChunk(data: Uint8Array): number {
  if (data.length === 0) return 0;
  let maxVal = 0;
  let step = 2; // check every sample
  if (data.length > 1000) step = 10;
  for (let i = 0; i < data.length - 1; i += step * 2) {
    const byte1 = data[i];
    const byte2 = data[i + 1];
    let sample = (byte2 << 8) | byte1;
    if (sample > 32767) sample -= 65536;
    const abs = Math.abs(sample);
    if (abs > maxVal) maxVal = abs;
  }
  let normalized = Math.min(Math.max(maxVal / 12000, 0), 1);
  if (normalized < 0.05) normalized = 0.02;
  return normalized;
}
