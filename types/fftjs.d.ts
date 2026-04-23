declare module 'fft.js' {
  export default class FFT {
    constructor(size: number);
    createComplexArray(): Float32Array;
    realTransform(out: Float32Array, input: Float32Array): void;
    inverseTransform(out: Float32Array, input: Float32Array): void;
    completeSpectrum?(spectrum: Float32Array): void;
  }
}
