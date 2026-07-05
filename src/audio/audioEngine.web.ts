/**
 * Web audio engine using the Web Audio API (`getUserMedia` + `AudioWorklet`).
 *
 * Captures microphone audio as Float32 samples in an AudioWorkletProcessor,
 * posts them to the main thread where we convert to S16_LE PCM Uint8Array
 * chunks and forward to the caller's `onChunk` callback. The same `vad.ts`
 * silence detection runs against these chunks verbatim.
 *
 * Playback is straightforward: a Blob URL is constructed from the WAV bytes
 * and played back through a hidden `<audio>` element.
 */
import { AudioEngine, StartRecordingOptions, PlayOptions } from './audioEngine';

const PCM_PROCESSOR_CODE = `
class PcmProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const ch = input[0];
      // Float32 -> Int16 LE
      const len = ch.length;
      const out = new Uint8Array(len * 2);
      for (let i = 0; i < len; i++) {
        let s = Math.max(-1, Math.min(1, ch[i]));
        const v = (s < 0 ? s * 0x8000 : s * 0x7fff) | 0;
        out[i * 2] = v & 0xff;
        out[i * 2 + 1] = (v >> 8) & 0xff;
      }
      this.port.postMessage(out, [out.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm-processor', PcmProcessor);
`;

export class WebAudioEngine implements AudioEngine {
  private audioContext?: AudioContext;
  private mediaStream?: MediaStream;
  private workletNode?: AudioWorkletNode;
  private onChunk?: (pcm: Uint8Array) => void;
  private audioEl?: HTMLAudioElement;
  private blobUrl?: string;

  async requestPermission(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }

  async startRecording(opts: StartRecordingOptions): Promise<void> {
    if (!navigator.mediaDevices) throw new Error('Web Audio API not supported');
    this.onChunk = opts.onChunk;
    const ctxCtor: typeof AudioContext =
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ??
      window.AudioContext;
    this.audioContext = new ctxCtor({ sampleRate: opts.sampleRate ?? 44100 });
    // Need audio worklet processor. Build module URL on the fly.
    const blob = new Blob([PCM_PROCESSOR_CODE], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    try {
      await this.audioContext.audioWorklet.addModule(url);
    } finally {
      URL.revokeObjectURL(url);
    }
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: opts.numChannels ?? 1, echoCancellation: true, noiseSuppression: true },
      video: false,
    });
    const src = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      channelCount: opts.numChannels ?? 1,
    });
    this.workletNode.port.onmessage = (e) => {
      if (this.onChunk) this.onChunk(e.data as Uint8Array);
    };
    src.connect(this.workletNode);
  }

  async stopRecording(): Promise<Uint8Array> {
    // We don't keep raw PCM here (the silence VAD consumed it via onChunk).
    // Return empty; the live conversation screen builds its own buffer.
    try {
      this.workletNode?.port.close();
      this.workletNode?.disconnect();
    } catch { /* ignore */ }
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    if (this.audioContext) {
      try { await this.audioContext.close(); } catch { /* ignore */ }
      this.audioContext = undefined;
    }
    return new Uint8Array();
  }

  async play(wavBytes: Uint8Array, opts?: PlayOptions): Promise<void> {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl = undefined;
    }
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
    const blob = new Blob([wavBytes as BlobPart], { type: 'audio/wav' });
    this.blobUrl = URL.createObjectURL(blob);
    this.audioEl = document.createElement('audio');
    this.audioEl.src = this.blobUrl;
    this.audioEl.onended = () => opts?.onEnd?.();
    this.audioEl.onerror = () => opts?.onError?.(new Error('audio playback failed'));
    try {
      await this.audioEl.play();
    } catch (e) {
      opts?.onError?.(e as Error);
      opts?.onEnd?.();
    }
  }

  async stopPlayback(): Promise<void> {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl = undefined;
    }
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = undefined;
    }
  }

  dispose(): void {
    void this.stopPlayback();
    void this.stopRecording();
  }
}
