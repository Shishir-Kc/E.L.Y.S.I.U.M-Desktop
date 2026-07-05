/**
 * A growable byte buffer mimicking Dart's `BytesBuilder`.
 * Used to accumulate raw PCM chunks during recording.
 */
export class BytesBuilder {
  private chunks: Uint8Array[] = [];
  private _length = 0;

  add(bytes: Uint8Array): void {
    this.chunks.push(bytes);
    this._length += bytes.length;
  }

  clear(): void {
    this.chunks = [];
    this._length = 0;
  }

  toBytes(): Uint8Array {
    const out = new Uint8Array(this._length);
    let offset = 0;
    for (const c of this.chunks) {
      out.set(c, offset);
      offset += c.length;
    }
    return out;
  }

  get length(): number {
    return this._length;
  }

  get isEmpty(): boolean {
    return this._length === 0;
  }
}
