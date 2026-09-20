// Speaker presentation — colors from docs/archive/live-prototype-spec-v1.md §6 (spec 06 §2.3),
// extended with a 4th color the prototype needs but the archive didn't (green).

export interface SpeakerMeta {
  label: string;
  initial: string;
  color: string;
  side: "left" | "right";
}

const COLORS = [
  "oklch(0.62 0.10 250)", // Locuteur 1 — bleu
  "oklch(0.62 0.10 30)", // Locuteur 2 — orangé
  "oklch(0.55 0.005 280)", // Locuteur 3 — gris froid
  "oklch(0.62 0.10 145)", // Locuteur 4 — vert
];

const UNKNOWN_COLOR = "oklch(0.55 0.005 280)";

function speakerIndex(speakerId: string | null): number {
  if (!speakerId) return -1;
  const match = /spk_(\d+)/.exec(speakerId);
  return match ? Number.parseInt(match[1], 10) : -1;
}

export function getSpeakerMeta(speakerId: string | null): SpeakerMeta {
  const index = speakerIndex(speakerId);
  if (index < 0) {
    return { label: "Locuteur ?", initial: "?", color: UNKNOWN_COLOR, side: "left" };
  }
  return {
    label: `Locuteur ${index + 1}`,
    initial: String.fromCharCode(65 + index), // A, B, C, D — matches the design mockup's avatar style
    color: COLORS[index % COLORS.length],
    side: index === 1 ? "right" : "left",
  };
}
