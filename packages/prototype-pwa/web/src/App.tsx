import { useCallback, useRef, useState } from "react";

import { ClaimsPanel } from "@/components/ClaimsPanel";
import { Header, type StatusVariant } from "@/components/Header";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { LatencyTracker } from "@/lib/latency";
import { Recorder } from "@/lib/recorder";
import type { ClaimWithMeta, DisplaySegment, ServerEvent } from "@/lib/types";
import { WsClient } from "@/lib/ws-client";

const WS_PROTOCOL = location.protocol === "https:" ? "wss:" : "ws:";
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT ?? "8000";
const WS_URL = `${WS_PROTOCOL}//${location.hostname}:${SERVER_PORT}/ws`;

function replaceOrAppendInterim(prev: DisplaySegment[], segment: DisplaySegment): DisplaySegment[] {
  for (let i = prev.length - 1; i >= 0; i--) {
    if (prev[i].speaker_id === segment.speaker_id && !prev[i].is_final) {
      const next = [...prev];
      next[i] = segment;
      return next;
    }
  }
  return [...prev, segment];
}

export default function App() {
  const [recording, setRecording] = useState(false);
  const [statusText, setStatusText] = useState("⏸ En pause");
  const [statusVariant, setStatusVariant] = useState<StatusVariant>("idle");
  const [segments, setSegments] = useState<DisplaySegment[]>([]);
  const [claims, setClaims] = useState<ClaimWithMeta[]>([]);

  const latencyTracker = useRef(new LatencyTracker());
  const interimIdBySpeaker = useRef(new Map<string, string>());

  const handleServerEvent = useCallback((event: ServerEvent) => {
    switch (event.type) {
      case "session":
        break;

      case "transcript": {
        const key = event.data.speaker_id ?? "unknown";
        let id = interimIdBySpeaker.current.get(key);
        if (!id) {
          id = crypto.randomUUID();
        }
        if (event.data.is_final) {
          interimIdBySpeaker.current.delete(key);
        } else {
          interimIdBySpeaker.current.set(key, id);
        }

        const display: DisplaySegment = { ...event.data, id };
        setSegments((prev) => replaceOrAppendInterim(prev, display));

        if (event.data.is_final) {
          latencyTracker.current.recordFinalSegment(event.data.text);
        }
        break;
      }

      case "claim": {
        const latencyMs = latencyTracker.current.estimateForClaim(event.data.raw_quote);
        const withMeta: ClaimWithMeta = { ...event.data, latencyMs, receivedAt: Date.now() };
        setClaims((prev) => [withMeta, ...prev]);
        break;
      }

      case "status":
        setStatusText(`⚠ ${event.data.text}`);
        setStatusVariant("error");
        break;
    }
  }, []);

  const recordingRef = useRef(false);

  const wsClient = useRef(
    new WsClient(
      WS_URL,
      (event) => handleServerEvent(event),
      (connected) => {
        if (!recordingRef.current) return;
        setStatusText(connected ? "● En écoute" : "⟳ Reconnexion…");
        setStatusVariant(connected ? "listening" : "warning");
      },
    ),
  );

  const recorder = useRef(new Recorder((frame) => wsClient.current.sendAudioFrame(frame)));

  const startRecording = useCallback(async () => {
    try {
      setStatusText("⟳ Démarrage…");
      setStatusVariant("warning");
      setSegments([]);
      setClaims([]);
      interimIdBySpeaker.current.clear();

      wsClient.current.connect();
      await recorder.current.start();
      wsClient.current.sendAction("start");

      recordingRef.current = true;
      setRecording(true);
      setStatusText("● En écoute");
      setStatusVariant("listening");
    } catch (err) {
      console.error("Failed to start recording", err);
      recordingRef.current = false;
      setRecording(false);
      setStatusText("⚠ Micro indisponible");
      setStatusVariant("error");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    recordingRef.current = false;
    wsClient.current.sendAction("stop");
    await recorder.current.stop();
    wsClient.current.disconnect();
    setRecording(false);
    setStatusText("⏸ En pause");
    setStatusVariant("idle");
  }, []);

  const onToggle = useCallback(() => {
    if (recording) {
      void stopRecording();
    } else {
      void startRecording();
    }
  }, [recording, startRecording, stopRecording]);

  return (
    <div className="flex h-screen flex-col">
      <Header statusText={statusText} statusVariant={statusVariant} recording={recording} onToggle={onToggle} />
      <main className="grid min-h-0 flex-1 grid-cols-2">
        <section className="flex min-h-0 flex-col border-r border-border">
          <div className="border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Transcription
          </div>
          <TranscriptPanel segments={segments} />
        </section>
        <section className="flex min-h-0 flex-col">
          <div className="border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Affirmations à vérifier
          </div>
          <ClaimsPanel claims={claims} />
        </section>
      </main>
    </div>
  );
}
