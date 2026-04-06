import { Mp3Encoder } from 'lamejs';

// Convert AudioBuffer to WAV Blob
export function bufferToWave(abuffer: AudioBuffer, len: number): Blob {
    let numOfChan = abuffer.numberOfChannels;
    let length = len * numOfChan * 2 + 44;
    let buffer = new ArrayBuffer(length);
    let view = new DataView(buffer);
    let channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;
  
    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
  
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this example)
  
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length
  
    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));
  
    while (pos < len) {
      for (i = 0; i < numOfChan; i++) {
        // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
        view.setInt16(44 + offset, sample, true); // write 16-bit sample
        offset += 2;
      }
      pos++;
    }
  
    return new Blob([buffer], { type: "audio/wav" });
  }
  
  function setUint16(data: number) {
    // @ts-ignore
    this.view.setUint16(this.pos, data, true);
    // @ts-ignore
    this.pos += 2;
  }
  
  function setUint32(data: number) {
     // Helper specifically for the bufferToWave context, handled manually above usually
     // but rewriting to be cleaner for standard usage:
  }

  // Rewrite bufferToWave helper for cleaner standalone usage without 'this' context issues
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
  
  export function simpleBufferToWave(abuffer: AudioBuffer, len?: number): Blob {
      const numOfChan = abuffer.numberOfChannels;
      const length = (len || abuffer.length) * numOfChan * 2 + 44;
      const buffer = new ArrayBuffer(length);
      const view = new DataView(buffer);
      const channels = [];
      let i;
      let sample;
      let offset = 0;
      let pos = 0;
  
      // RIFF identifier
      writeString(view, 0, 'RIFF');
      // RIFF chunk length
      view.setUint32(4, 36 + (len || abuffer.length) * numOfChan * 2, true);
      // RIFF type
      writeString(view, 8, 'WAVE');
      // format chunk identifier
      writeString(view, 12, 'fmt ');
      // format chunk length
      view.setUint32(16, 16, true);
      // sample format (raw)
      view.setUint16(20, 1, true);
      // channel count
      view.setUint16(22, numOfChan, true);
      // sample rate
      view.setUint32(24, abuffer.sampleRate, true);
      // byte rate (sample rate * block align)
      view.setUint32(28, abuffer.sampleRate * 4, true);
      // block align (channel count * bytes per sample)
      view.setUint16(32, numOfChan * 2, true);
      // bits per sample
      view.setUint16(34, 16, true);
      // data chunk identifier
      writeString(view, 36, 'data');
      // data chunk length
      view.setUint32(40, (len || abuffer.length) * numOfChan * 2, true);
  
      for(i = 0; i < abuffer.numberOfChannels; i++)
          channels.push(abuffer.getChannelData(i));
  
      offset = 44;
      while(pos < (len || abuffer.length)){
          for(i = 0; i < numOfChan; i++){
              sample = Math.max(-1, Math.min(1, channels[i][pos]));
              sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
              view.setInt16(offset, sample, true);
              offset += 2;
          }
          pos++;
      }
      return new Blob([buffer], { type: "audio/wav" });
  }
  
  export const getSamplesFromBuffer = (buffer: AudioBuffer, width: number) => {
    const channelData = buffer.getChannelData(0); // View first channel
    const step = Math.ceil(channelData.length / width);
    const amp = Math.max(...channelData); // To normalize? Usually just drawing raw.
    
    // Simple decimation for visualization
    const samples = [];
    for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        for (let j = 0; j < step; j++) {
            const datum = channelData[i * step + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        // Push max amplitude for this chunk
        samples.push(Math.max(Math.abs(min), Math.abs(max)));
    }
    return samples;
  };

// --- Buffer Manipulation Helpers ---

export const sliceBuffer = (ctx: AudioContext, buffer: AudioBuffer, begin: number, end: number): AudioBuffer => {
    const frameCount = Math.floor((end - begin) * buffer.sampleRate);
    if (frameCount <= 0) return ctx.createBuffer(buffer.numberOfChannels, 1, buffer.sampleRate); // Safe fallback
    
    const newBuffer = ctx.createBuffer(buffer.numberOfChannels, frameCount, buffer.sampleRate);
    const startSample = Math.floor(begin * buffer.sampleRate);

    for (let i = 0; i < buffer.numberOfChannels; i++) {
        const oldData = buffer.getChannelData(i);
        const newData = newBuffer.getChannelData(i);
        for (let j = 0; j < frameCount; j++) {
            newData[j] = oldData[startSample + j] || 0;
        }
    }
    return newBuffer;
};

export const concatBuffers = (ctx: AudioContext, buf1: AudioBuffer, buf2: AudioBuffer): AudioBuffer => {
    const numChannels = Math.min(buf1.numberOfChannels, buf2.numberOfChannels);
    const frameCount = buf1.length + buf2.length;
    const newBuffer = ctx.createBuffer(numChannels, frameCount, buf1.sampleRate);

    for (let i = 0; i < numChannels; i++) {
        const channel = newBuffer.getChannelData(i);
        channel.set(buf1.getChannelData(i), 0);
        channel.set(buf2.getChannelData(i), buf1.length);
    }
    return newBuffer;
};

export const removeRange = (ctx: AudioContext, buffer: AudioBuffer, start: number, end: number): AudioBuffer => {
    // 1. Slice 0 -> start
    const part1 = sliceBuffer(ctx, buffer, 0, start);
    // 2. Slice end -> duration
    const part2 = sliceBuffer(ctx, buffer, end, buffer.duration);
    // 3. Concat
    return concatBuffers(ctx, part1, part2);
};

export const cloneBuffer = (ctx: AudioContext, buffer: AudioBuffer): AudioBuffer => {
    const newBuffer = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        newBuffer.getChannelData(i).set(buffer.getChannelData(i));
    }
    return newBuffer;
};

export const fadeBuffer = (ctx: AudioContext, buffer: AudioBuffer, start: number, end: number, type: 'in' | 'out'): AudioBuffer => {
    const newBuffer = cloneBuffer(ctx, buffer);
    const startSample = Math.floor(start * buffer.sampleRate);
    const endSample = Math.floor(end * buffer.sampleRate);
    const length = endSample - startSample;

    for (let c = 0; c < newBuffer.numberOfChannels; c++) {
        const data = newBuffer.getChannelData(c);
        for (let i = 0; i < length; i++) {
            const index = startSample + i;
            let gain = 1.0;
            const progress = i / length;
            
            if (type === 'in') {
                gain = progress;
            } else {
                gain = 1.0 - progress;
            }
            
            if (index < data.length) data[index] *= gain;
        }
    }
    return newBuffer;
};

export const reverseBuffer = (ctx: AudioContext, buffer: AudioBuffer, start: number, end: number): AudioBuffer => {
  const newBuffer = cloneBuffer(ctx, buffer);
  const startSample = Math.floor(start * buffer.sampleRate);
  const endSample = Math.floor(end * buffer.sampleRate);

  for (let c = 0; c < newBuffer.numberOfChannels; c++) {
      const data = newBuffer.getChannelData(c);
      // Create copy
      const segment = new Float32Array(data.subarray(startSample, endSample));
      segment.reverse();
      data.set(segment, startSample);
  }
  return newBuffer;
};

export const bufferToMp3 = (buffer: AudioBuffer, bitrate: number = 128): Blob => {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const mp3enc = new Mp3Encoder(channels, sampleRate, bitrate);
    const mp3Data: Int8Array[] = [];
    
    // Get channel data
    // lamejs expects Int16 samples (signed short)
    
    const leftRaw = buffer.getChannelData(0);
    const rightRaw = channels > 1 ? buffer.getChannelData(1) : undefined;
    
    // We need to convert float [-1, 1] to int16 [-32768, 32767]
    // Loop through in chunks to prevent blocking UI too much (though this is synchronous)
    // For large files this should ideally be in a worker.
    
    const sampleBlockSize = 1152; // multiple of 576
    
    const left = new Int16Array(leftRaw.length);
    const right = rightRaw ? new Int16Array(rightRaw.length) : undefined;
    
    for (let i = 0; i < leftRaw.length; i++) {
        // Clamp and scale
        let s = Math.max(-1, Math.min(1, leftRaw[i]));
        left[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF) | 0;
        
        if (right && rightRaw) {
             s = Math.max(-1, Math.min(1, rightRaw[i]));
             right[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF) | 0;
        }
    }
    
    const remaining = left.length;
    for (let i = 0; i < remaining; i += sampleBlockSize) {
        const leftChunk = left.subarray(i, i + sampleBlockSize);
        let rightChunk: Int16Array | undefined;
        if (right) {
            rightChunk = right.subarray(i, i + sampleBlockSize);
        }
        
        const mp3buf = mp3enc.encodeBuffer(leftChunk, rightChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    
    const mp3buf = mp3enc.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
    
    return new Blob(mp3Data as BlobPart[], { type: 'audio/mp3' });
};
