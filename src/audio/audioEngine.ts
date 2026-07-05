/**
 * AudioEngine interface + platform dispatcher.
 *
 * The Flutter app had three native audio behaviours:
 *  1. `record.startStream(RecordConfig(pcm16bits, 44100, mono))` — get a stream
 *     of raw S16_LE PCM bytes from the microphone.
 *  2. `audioplayers.AudioPlayer.play(BytesSource(bytes))` — play a WAV/PCM
 *     buffer from memory.
 *  3. On Linux specifically, spawn `arecord` as a fallback. We don't need this
 *     on RN (the device API is the only path), but we keep it noted.
 *
 * On native (Android/iOS) we use `react-native-audio-recorder-player`:
 *  - Recording: `startRecorderWithStream` returns a metering-only stream; for
 *    raw PCM we use the `audioRecorderPlayer.startRecorder()` API to a temp
 *    file, then read it back. To keep silence detection working live, we also
 *    subscribe to metering events which expose a current amplitude value.
 *    For VAD, we map the metering value back through the same threshold logic.
 *  - Playback: `startPlayer({ uri })` after writing the WAV bytes to a temp
 *    file via expo-file-system / react-native-fs.
 *
 * On web we use the Web Audio API:
 *  - Recording: getUserMedia + AudioWorklet captures Float32 samples which we
 *    convert to Int16 PCM and emit as Uint8Array chunks. Same VAD math.
 *  - Playback: a hidden `<audio>` element with a Blob URL of the WAV bytes.
 *
 * The interface intentionally exposes raw PCM chunks (Uint8Array of S16_LE) so
 * the shared `vad.ts` and `wav.ts` modules don't need to know which platform
 * produced the data.
 */
import { Platform } from 'react-native';

export interface StartRecordingOptions {
  /** Sample rate in Hz. Default 44100 to match the Flutter app. */
  sampleRate?: number;
  /** Number of channels. Default 1 (mono). */
  numChannels?: number;
  /** Called for every captured raw PCM chunk (S16_LE little-endian). */
  onChunk: (pcm: Uint8Array) => void;
}

export interface PlayOptions {
  /** Called when playback completes (TTS finished). */
  onEnd?: () => void;
  /** Called on playback error. */
  onError?: (e: Error) => void;
}

export interface AudioEngine {
  /**
   * Request microphone permission. Returns true if granted.
   */
  requestPermission(): Promise<boolean>;

  /**
   * Begin streaming microphone audio as raw PCM chunks.
   * Resolves when the stream is active.
   */
  startRecording(opts: StartRecordingOptions): Promise<void>;

  /**
   * Stop recording and return all raw PCM bytes captured since start.
   */
  stopRecording(): Promise<Uint8Array>;

  /**
   * Play a WAV buffer (already including header). Returns when playback ends.
   */
  play(wavBytes: Uint8Array, opts?: PlayOptions): Promise<void>;

  /** Stop any active playback. */
  stopPlayback(): Promise<void>;

  /** Release all native resources. */
  dispose(): void;
}

/**
 * Returns the platform-appropriate implementation. Lazy-imported so that
 * `audioEngine.web.ts` (which references `window`, `AudioContext`, etc.) is
 * never evaluated on a native target.
 */
let cached: AudioEngine | null = null;

export async function getAudioEngine(): Promise<AudioEngine> {
  if (cached) return cached;
  if (Platform.OS === 'web') {
    const mod = await import('./audioEngine.web');
    cached = new mod.WebAudioEngine();
  } else {
    const mod = await import('./audioEngine.native');
    cached = new mod.NativeAudioEngine();
  }
  return cached;
}
