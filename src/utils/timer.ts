/**
 * Tiny platform-agnostic timer wrapper. On native it uses setTimeout; on web it
 * prefers setTimeout as well. Exposed so vad.ts / live-conversation screen can
 * reason about timer identity (== null check after cancel).
 */

export class NativeTimer {
  private id: ReturnType<typeof setTimeout> | null = null;

  constructor(callback: () => void, ms: number) {
    this.id = setTimeout(() => {
      this.id = null;
      callback();
    }, ms);
  }

  cancel(): void {
    if (this.id !== null) {
      clearTimeout(this.id);
      this.id = null;
    }
  }

  get isPending(): boolean {
    return this.id !== null;
  }
}
