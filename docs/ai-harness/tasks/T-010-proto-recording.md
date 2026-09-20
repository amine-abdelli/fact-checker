# T-010 — Prototype: continuous recording in the PWA
**Skill:** plumb-proto · **Agent:** proto-engineer · **Blocked by:** nothing

## Goal
`packages/prototype-pwa/web` records the microphone continuously and streams raw PCM to a WebSocket,
and we know exactly how it behaves over 20 minutes, in the background, and on a phone.

## Read first
- `packages/prototype-pwa/README.md` · the `plumb-proto` skill
- `docs/archive/live-prototype-spec-v1.md` §3 (prior art: frame size, sample rate)

## Deliverables
- `web/` — vite + TypeScript, AudioWorklet capture (mono 16 kHz, ~250 ms frames), binary WebSocket
  client with backoff reconnect, start/stop control with a visible state, Wake Lock
- `manifest.json` + a minimal service worker — installability, not offline support
- A dev echo server or a stub endpoint so the page can be tested before T-011 exists

## Acceptance criteria
- [ ] 20 minutes foreground recording, zero dropouts, frame count matches expected rate
- [ ] Behaviour measured and written down for: tab backgrounded, window blurred, phone screen locked
- [ ] Socket drop mid-session → reconnect without ending the recording
- [ ] Runs over HTTPS on a LAN address so it can be tested from a phone
- [ ] Mic permission and recording state always visible to the user
