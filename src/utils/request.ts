/**
 * axios HTTP wrapper. Replaces Flutter's `package:http`.
 *
 *   - JSON postChat (Flutter `_fetchResponse` in chat_screen.dart:128-164)
 *   - multipart POST for transcription (`_transcribeAudio` chat_screen.dart:178-232)
 *   - multipart POST for live conversation (`_sendAudioToBackend` live_conversation_screen.dart:201-228)
 *   - raw bytes response for TTS playback
 *
 * On React Native, `FormData` natively supports { uri } values for file
 * upload; on web we use Blob. Both go through axios as multipart/form-data.
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { urlFor } from '../config/api';

export const http: AxiosInstance = axios.create({
  timeout: 60000,
  headers: { Accept: 'application/json' },
  responseType: 'json',
});

export interface ChatReply {
  reply?: string;
}

/**
 * POST {chat: message} → expects {reply: string}.
 * Mirrors Flutter `_fetchResponse`.
 */
export async function postChat(endpointPath: string, message: string): Promise<string> {
  const res = await http.post<ChatReply>(urlFor(endpointPath), { chat: message }, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status >= 200 && res.status < 300 && res.data?.reply) {
    return String(res.data.reply);
  }
  throw new Error(`Chat request failed: ${res.status}`);
}

/**
 * Upload a WAV file for transcription. Mirrors Flutter `_transcribeAudio`.
 * Returns the transcribed text or null.
 *
 * `audio` is either a { uri } object (native) or a Blob/Uint8Array (web).
 */
export interface UploadHandle {
  /** Native file URI (file://...) or web Blob. */
  uri?: string;
  blob?: Blob;
  bytes?: Uint8Array;
  filename: string;
  contentType: string;
}

export async function transcribeAudio(handle: UploadHandle): Promise<string | null> {
  const form = new FormData();
  form.append('file', handle as any, handle.filename);

  const res = await axios.post(urlFor('/v1/transcribe/'), form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'json',
  });
  if (res.status >= 200 && res.status < 300 && res.data?.text) {
    return String(res.data.text);
  }
  return null;
}

/**
 * POST audio for live conversation. Mirrors `_sendAudioToBackend`.
 * Returns the WAV/PCM bytes of the spoken response.
 */
export async function sendLiveAudio(handle: UploadHandle): Promise<Uint8Array | null> {
  const form = new FormData();
  form.append('file', handle as any, handle.filename);

  const res: AxiosResponse<ArrayBuffer> = await axios.post(urlFor('/v1/live/conv/'), form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'arraybuffer',
  });
  if (res.status >= 200 && res.status < 300 && res.data) {
    return new Uint8Array(res.data);
  }
  return null;
}
