const FRAME_STRIDE_BYTES = 24;

export class DSPWASM {
  instance: WebAssembly.Instance | null = null;
  memory: WebAssembly.Memory | null = null;
  private framePtr = 0;
  private inputPtr = 0;
  private outputPtr = 0;

  async init(wasmUrl: string, sampleRate: number): Promise<void> {
    const res = await fetch(wasmUrl);
    const bytes = await res.arrayBuffer();

    const wasmModule = await WebAssembly.instantiate(bytes, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        abort: () => {
          throw new Error('WASM abort');
        },
      },
    });

    this.instance = wasmModule.instance;

    const exports = this.instance.exports as Record<string, unknown>;
    this.memory = exports.memory as WebAssembly.Memory;

    (exports.init_engine as (sampleRate: number) => void)(sampleRate);
    this.framePtr = (exports.get_frame_ptr as () => number)();
    this.inputPtr = (exports.get_input_ptr as () => number)();
    this.outputPtr = (exports.get_output_ptr as () => number)();
  }

  isReady(): boolean {
    return this.instance !== null && this.memory !== null;
  }

  getInputPtr(): number {
    return this.inputPtr;
  }

  getOutputPtr(): number {
    return this.outputPtr;
  }

  writeInput(input: Float32Array): void {
    if (!this.memory) throw new Error('WASM memory not initialized');
    new Float32Array(this.memory.buffer).set(input, this.inputPtr / 4);
  }

  readOutput(size: number, target: Float32Array): void {
    if (!this.memory) throw new Error('WASM memory not initialized');
    target.set(new Float32Array(this.memory.buffer, this.outputPtr, size));
  }

  processFrame(timeRatio: number, pitchRatio: number, size: number): void {
    if (!this.instance || !this.memory) throw new Error('WASM not initialized');

    const view = new DataView(this.memory.buffer, this.framePtr, FRAME_STRIDE_BYTES);
    view.setUint32(0, this.inputPtr, true);
    view.setUint32(4, this.outputPtr, true);
    view.setFloat32(8, timeRatio, true);
    view.setFloat32(12, pitchRatio, true);
    view.setInt32(16, size, true);
    view.setInt32(20, size, true);

    (this.instance.exports.process_frame as (framePtr: number) => void)(this.framePtr);
  }
}
