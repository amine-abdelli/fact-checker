// WebSocket client: binary audio frames out, JSON events in. Reconnects with backoff on
// drop — recording must never stop just because the socket did (T-010 acceptance
// criterion), so audio frames queue in a small bounded buffer while disconnected.

import type { ServerEvent } from "./types";

const MAX_QUEUED_FRAMES = 40; // ~10s at 250ms/frame — enough to survive a reconnect, not a real outage
const BACKOFF_START_MS = 1000;
const BACKOFF_MAX_MS = 10000;

export type EventHandler = (event: ServerEvent) => void;
export type ConnectionStateHandler = (connected: boolean) => void;

export class WsClient {
  private socket: WebSocket | null = null;
  private url: string;
  private onEvent: EventHandler;
  private onConnectionState: ConnectionStateHandler;
  private frameQueue: ArrayBuffer[] = [];
  private backoffMs = BACKOFF_START_MS;
  private shouldReconnect = false;
  private reconnectTimer: number | undefined;

  constructor(url: string, onEvent: EventHandler, onConnectionState: ConnectionStateHandler) {
    this.url = url;
    this.onEvent = onEvent;
    this.onConnectionState = onConnectionState;
  }

  connect(): void {
    this.shouldReconnect = true;
    this.openSocket();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    window.clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.socket = null;
  }

  sendAction(action: "start" | "stop"): void {
    this.send(JSON.stringify({ action }));
  }

  sendAudioFrame(frame: ArrayBuffer): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.flushQueue();
      this.socket.send(frame);
      return;
    }
    this.frameQueue.push(frame);
    if (this.frameQueue.length > MAX_QUEUED_FRAMES) {
      this.frameQueue.shift(); // drop oldest — a long outage loses audio, not the session
    }
  }

  private flushQueue(): void {
    while (this.frameQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const frame = this.frameQueue.shift();
      if (frame) this.socket.send(frame);
    }
  }

  private send(data: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  private openSocket(): void {
    const socket = new WebSocket(this.url);
    socket.binaryType = "arraybuffer";
    this.socket = socket;

    socket.onopen = () => {
      this.backoffMs = BACKOFF_START_MS;
      this.onConnectionState(true);
      this.flushQueue();
    };

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        this.onEvent(JSON.parse(event.data) as ServerEvent);
      } catch (err) {
        console.warn("Malformed server event dropped", err);
      }
    };

    socket.onclose = () => {
      this.onConnectionState(false);
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect(): void {
    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      this.backoffMs = Math.min(this.backoffMs * 2, BACKOFF_MAX_MS);
      this.openSocket();
    }, this.backoffMs);
  }
}
