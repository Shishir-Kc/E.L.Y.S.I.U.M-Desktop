/**
 * WAV header construction — verbatim port of `_buildWavHeader` and
 * `_intToBytes` from `lib/screens/live_conversation_screen.dart:251-282`
 * and `lib/widgets/voice_input_widget.dart:205-243`.
 *
 * Builds a minimal 44-byte PCM/WAV header for raw S16_LE, 44.1kHz, mono PCM
 * audio captured from the mic stream. The header is prepended to the captured
 * PCM bytes to create a complete WAV file the backend can decode.
 */

export const SAMPLE_RATE = 44100;
export const NUM_CHANNELS = 1;
export const BITS_PER_SAMPLE = 16;
export const BYTE_RATE = (SAMPLE_RATE * NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
export const BLOCK_ALIGN = NUM_CHANNELS * (BITS_PER_SAMPLE / 8);

function intToBytes(value: number, length: number): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < length; i++) {
    bytes.push((value >> (8 * i)) & 0xff);
  }
  return bytes;
}

function strToBytes(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i) & 0xff);
  return out;
}

/**
 * Returns a Uint8Array containing the 44-byte WAV header followed by the
 * provided raw PCM bytes. Equivalent to the Dart:
 *   final wavHeader = _buildWavHeader(rawBytes.length);
 *   final wavBytes = Uint8List.fromList(wavHeader + rawBytes);
 */
export function buildWav(rawPcm: Uint8Array): Uint8Array {
  const dataLength = rawPcm.length;
  const totalDataLen = dataLength + 36;

  const header: number[] = [
    ...strToBytes('RIFF'),
    ...intToBytes(totalDataLen, 4),
    ...strToBytes('WAVE'),
    ...strToBytes('fmt '),
    ...intToBytes(16, 4),
    ...intToBytes(1, 2), // PCM
    ...intToBytes(NUM_CHANNELS, 2),
    ...intToBytes(SAMPLE_RATE, 4),
    ...intToBytes(BYTE_RATE, 4),
    ...intToBytes(BLOCK_ALIGN, 2),
    ...intToBytes(BITS_PER_SAMPLE, 2),
    ...strToBytes('data'),
    ...intToBytes(dataLength, 4),
  ];

  const out = new Uint8Array(header.length + dataLength);
  out.set(header, 0);
  out.set(rawPcm, header.length);
  return out;
}
