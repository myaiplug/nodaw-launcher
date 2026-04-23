export class RingBuffer {
  private readonly buffer: Float32Array;
  private writePtr = 0;
  private readPtr = 0;
  private available = 0;

  constructor(private readonly size: number) {
    this.buffer = new Float32Array(size);
  }

  clear(): void {
    this.writePtr = 0;
    this.readPtr = 0;
    this.available = 0;
    this.buffer.fill(0);
  }

  getAvailableRead(): number {
    return this.available;
  }

  getAvailableWrite(): number {
    return this.size - this.available;
  }

  write(input: Float32Array): number {
    const writable = Math.min(input.length, this.getAvailableWrite());

    for (let i = 0; i < writable; i++) {
      this.buffer[this.writePtr] = input[i];
      this.writePtr = (this.writePtr + 1) % this.size;
    }

    this.available += writable;
    return writable;
  }

  read(output: Float32Array): number {
    const readable = Math.min(output.length, this.available);

    for (let i = 0; i < readable; i++) {
      output[i] = this.buffer[this.readPtr];
      this.readPtr = (this.readPtr + 1) % this.size;
    }

    if (readable < output.length) {
      output.fill(0, readable);
    }

    this.available -= readable;
    return readable;
  }
}
