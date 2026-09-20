// Microphone capture via AudioWorklet. Raw PCM frames are handed to onFrame; this module
// knows nothing about the network — see ws-client.ts. Audio never touches disk or any
// destination other than the caller-provided sink (project rule 5: audio only to ASR).

export type FrameHandler = (frame: ArrayBuffer) => void;

export class Recorder {
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private wakeLock: WakeLockSentinel | null = null;
  private onFrame: FrameHandler;
  private visibilityHandler = () => {
    void this.reacquireWakeLockIfNeeded();
  };

  constructor(onFrame: FrameHandler) {
    this.onFrame = onFrame;
  }

  get isRecording(): boolean {
    return this.audioContext !== null;
  }

  async start(): Promise<void> {
    if (this.isRecording) return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    // Browsers may ignore this hint (notably some iOS Safari versions); the worklet
    // resamples defensively when the actual rate differs (see pcm-worklet-processor.js).
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    await this.audioContext.audioWorklet.addModule("/pcm-worklet-processor.js");

    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.workletNode = new AudioWorkletNode(this.audioContext, "pcm-processor");
    this.workletNode.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      this.onFrame(event.data);
    };
    source.connect(this.workletNode);

    await this.acquireWakeLock();
    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  async stop(): Promise<void> {
    document.removeEventListener("visibilitychange", this.visibilityHandler);

    this.workletNode?.disconnect();
    this.workletNode = null;

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    await this.releaseWakeLock();
  }

  private async acquireWakeLock(): Promise<void> {
    try {
      if ("wakeLock" in navigator) {
        this.wakeLock = await navigator.wakeLock.request("screen");
      }
    } catch (err) {
      console.warn("Wake Lock unavailable", err);
    }
  }

  private async releaseWakeLock(): Promise<void> {
    try {
      await this.wakeLock?.release();
    } catch {
      // ignored — page is tearing down the session anyway
    }
    this.wakeLock = null;
  }

  private async reacquireWakeLockIfNeeded(): Promise<void> {
    // Wake Lock is auto-released when the tab is hidden; reacquire on return if still recording.
    if (document.visibilityState === "visible" && this.isRecording && this.wakeLock === null) {
      await this.acquireWakeLock();
    }
  }
}
