import { useCallback, useMemo, useRef, useState } from "react";

import { AppBar, type StatusVariant } from "@/components/AppBar";
import { BottomNav, type MobileView } from "@/components/BottomNav";
import { ClaimsPanel } from "@/components/ClaimsPanel";
import { ALL_SPEAKERS, FilterTabs } from "@/components/FilterTabs";
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
  const [filterSpeaker, setFilterSpeaker] = useState<string>(ALL_SPEAKERS);
  const [mobileView, setMobileView] = useState<MobileView>("flux");
  const [clockText, setClockText] = useState(() => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));

  const speakerIds = useMemo(() => {
    const seen = new Set<string>();
    for (const s of segments) if (s.speaker_id) seen.add(s.speaker_id);
    for (const c of claims) if (c.speaker_id) seen.add(c.speaker_id);
    return [...seen].sort();
  }, [segments, claims]);

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
      setFilterSpeaker(ALL_SPEAKERS);
      interimIdBySpeaker.current.clear();

      wsClient.current.connect();
      await recorder.current.start();
      wsClient.current.sendAction("start");

      recordingRef.current = true;
      setRecording(true);
      setStatusText("● En écoute");
      setStatusVariant("listening");
      setClockText(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
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
    <div className="mx-auto flex h-screen max-w-3xl flex-col md:max-w-none">
      <AppBar
        statusText={statusText}
        statusVariant={statusVariant}
        recording={recording}
        onToggle={onToggle}
        speakerIds={speakerIds}
        claimCount={claims.length}
        clockText={clockText}
      />
      <FilterTabs speakerIds={speakerIds} active={filterSpeaker} onChange={setFilterSpeaker} />
      <main className="grid min-h-0 flex-1 md:grid-cols-2">
        <section
          className={`flex min-h-0 flex-col border-border md:flex md:border-r ${mobileView === "transcription" ? "flex" : "hidden"}`}
        >
          <div className="hidden border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:block">
            Transcription
          </div>
          <TranscriptPanel segments={segments} />
        </section>
        <section className={`flex min-h-0 flex-col md:flex ${mobileView === "flux" ? "flex" : "hidden"}`}>
          <div className="hidden border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:block">
            Affirmations à vérifier
          </div>
          <ClaimsPanel claims={claims} filterSpeaker={filterSpeaker} />
        </section>
      </main>
      <BottomNav view={mobileView} onChange={setMobileView} />
    </div>
  );
}
