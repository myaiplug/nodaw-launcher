class TimeStretchProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const processorOptions = options?.processorOptions ?? {};

    this.blockSize = processorOptions.blockSize ?? 128;
    this.wasmUrl = processorOptions.wasmUrl ?? '/wasm/dsp.wasm';
    this.sampleRateValue = processorOptions.sampleRate ?? sampleRate;

    this.inputBuffer = new Float32Array(this.blockSize);
    this.outputBuffer = new Float32Array(this.blockSize);

    this.timeRatio = 1.0;
    this.pitchRatio = 1.0;

    this.wasmReady = false;
    this.memory = null;
    this.instance = null;
    this.inputPtr = 0;
    this.outputPtr = 0;
    this.framePtr = 0;

    this.port.onmessage = (event) => {
      if (event.data?.type === 'params') {
        this.timeRatio = event.data.timeRatio ?? this.timeRatio;
        this.pitchRatio = event.data.pitchRatio ?? this.pitchRatio;
      }
    };

    this.initWasm();
  }

  async initWasm() {
    try {
      const res = await fetch(this.wasmUrl);
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
      this.memory = this.instance.exports.memory;

      this.instance.exports.init_engine(this.sampleRateValue);
      this.inputPtr = this.instance.exports.get_input_ptr();
      this.outputPtr = this.instance.exports.get_output_ptr();
      this.framePtr = this.instance.exports.get_frame_ptr();
      this.wasmReady = true;
      this.port.postMessage({ type: 'ready' });
    } catch (error) {
      this.port.postMessage({ type: 'error', message: String(error) });
      this.wasmReady = false;
    }
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    if (!output || output.length === 0) {
      return true;
    }

    for (let channel = 0; channel < output.length; channel++) {
      const inputChannel = input?.[channel] ?? input?.[0];
      const outputChannel = output[channel];

      if (!inputChannel) {
        outputChannel.fill(0);
        continue;
      }

      if (!this.wasmReady || !this.instance || !this.memory) {
        outputChannel.set(inputChannel);
        continue;
      }

      this.inputBuffer.fill(0);
      this.inputBuffer.set(inputChannel.subarray(0, this.blockSize));

      const memory = new Float32Array(this.memory.buffer);
      memory.set(this.inputBuffer, this.inputPtr / 4);

      const frameView = new DataView(this.memory.buffer, this.framePtr, 24);
      frameView.setUint32(0, this.inputPtr, true);
      frameView.setUint32(4, this.outputPtr, true);
      frameView.setFloat32(8, this.timeRatio, true);
      frameView.setFloat32(12, this.pitchRatio, true);
      frameView.setInt32(16, this.blockSize, true);
      frameView.setInt32(20, this.blockSize, true);

      this.instance.exports.process_frame(this.framePtr);

      this.outputBuffer.set(memory.subarray(this.outputPtr / 4, this.outputPtr / 4 + this.blockSize));
      outputChannel.set(this.outputBuffer.subarray(0, outputChannel.length));
    }

    return true;
  }
}

registerProcessor('time-stretch-processor', TimeStretchProcessor);
