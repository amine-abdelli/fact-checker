// AudioWorkletProcessor: converts the mic's Float32 samples to mono 16 kHz PCM16LE and
// posts ~250 ms frames (8000 bytes) to the main thread. Runs on the audio rendering
// thread — no DOM, no imports, plain JS on purpose.
//
// We ask the AudioContext for a 16 kHz sample rate (see recorder.ts), but not every
// browser honors that request, so this processor resamples defensively whenever the
// actual context sampleRate differs from TARGET_SAMPLE_RATE.

const TARGET_SAMPLE_RATE = 16000;
const FRAME_MS = 250;
const TARGET_FRAME_SAMPLES = (TARGET_SAMPLE_RATE * FRAME_MS) / 1000;

class PcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._resampleRatio = TARGET_SAMPLE_RATE / sampleRate;
    this._outBuffer = new Int16Array(TARGET_FRAME_SAMPLES);
    this._outFill = 0;
    // Fractional read cursor into the (virtual) resampled stream, carried across calls.
    this._carry = 0;
  }

  _resample(input) {
    if (sampleRate === TARGET_SAMPLE_RATE) {
      return input;
    }
    const outLength = Math.floor(input.length * this._resampleRatio);
    const out = new Float32Array(outLength);
    for (let i = 0; i < outLength; i++) {
      const srcPos = i / this._resampleRatio;
      const srcIndexLow = Math.floor(srcPos);
      const srcIndexHigh = Math.min(srcIndexLow + 1, input.length - 1);
      const frac = srcPos - srcIndexLow;
      out[i] = input[srcIndexLow] * (1 - frac) + input[srcIndexHigh] * frac;
    }
    return out;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }
    const channel = input[0];
    if (!channel || channel.length === 0) {
      return true;
    }

    const resampled = this._resample(channel);

    for (let i = 0; i < resampled.length; i++) {
      const clamped = Math.max(-1, Math.min(1, resampled[i]));
      this._outBuffer[this._outFill] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      this._outFill++;

      if (this._outFill >= TARGET_FRAME_SAMPLES) {
        const frame = this._outBuffer.buffer.slice(0);
        this.port.postMessage(frame, [frame]);
        this._outBuffer = new Int16Array(TARGET_FRAME_SAMPLES);
        this._outFill = 0;
      }
    }

    return true;
  }
}

registerProcessor("pcm-processor", PcmProcessor);
