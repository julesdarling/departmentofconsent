// Chip vocabularies + serialization helpers for the redesigned scene flow.
// Chip data is serialized into existing SessionSide string fields so the
// scene view, edit, and join routes keep working without a DB migration.

export const MOODS: string[] = [
  "Soft",
  "Slow",
  "Rough",
  "Bratty",
  "Tender",
  "Dirty",
  "Playful",
  "Ritualistic",
  "Service",
  "Primal",
  "Worship",
  "Tease",
];

export const INTENSITY_LABELS = ["Cozy", "Warm", "Heated", "Intense", "Edge"];

export const SETTINGS: string[] = [
  "Home",
  "Their place",
  "Hotel",
  "Outside",
  "Play space",
];

export const DRESS: string[] = [
  "Naked",
  "Lingerie",
  "Streetwear",
  "Gear",
  "Their choice",
];

export const TIME_CONSTRAINTS: string[] = [
  "No rush",
  "Done by 10pm",
  "Done by midnight",
  "A few hours max",
];

export const SUBSTANCES: string[] = [
  "None",
  "Weed",
  "Alcohol",
  "Other",
];

export const BODY_CHECKINS: string[] = [
  "Sore back",
  "Sore shoulder",
  "On meds",
  "On period",
  "Recent injury",
  "Migraine-prone",
];

export const PARTNER_DYNAMICS: string[] = [
  "Just us",
  "Other partners aware",
  "Open relationship",
  "Polycule",
  "First time together",
];

// Yes/no/maybe boundary prompts. Each maps to a SessionSide field.
export interface YnmPrompt {
  key: "privacy" | "talkingAfter" | "penetrativeSex";
  label: string;
  hint?: string;
}

export const YNM_PROMPTS: YnmPrompt[] = [
  { key: "privacy", label: "Photos or videos during the scene?" },
  { key: "talkingAfter", label: "Talking about it with others after?" },
  { key: "penetrativeSex", label: "Penetrative sex during the scene?" },
];

// ---------- Vibe serialization ----------
//
// Encoded into SessionSide.vision so scene/recap views keep rendering it.
// Format: "::v1::" + base64(JSON({ moods, intensity, note })) on save.
// On read, falls back to plain text for legacy data.

const VIBE_PREFIX = "::v1::";

export interface Vibe {
  moods: string[];
  intensity: number; // 1..5
  note: string;
}

export const EMPTY_VIBE: Vibe = { moods: [], intensity: 3, note: "" };

export function encodeVibe(v: Vibe): string {
  // Keep human-readable trailer so existing recap views still show something
  // sensible even if they don't decode.
  const human = formatVibeHuman(v);
  return `${VIBE_PREFIX}${JSON.stringify(v)}\n${human}`;
}

export function decodeVibe(raw: string | undefined | null): Vibe {
  if (!raw) return { ...EMPTY_VIBE };
  if (!raw.startsWith(VIBE_PREFIX)) {
    // legacy free text — treat as note
    return { moods: [], intensity: 3, note: raw };
  }
  try {
    const body = raw.slice(VIBE_PREFIX.length).split("\n")[0];
    const parsed = JSON.parse(body) as Partial<Vibe>;
    return {
      moods: Array.isArray(parsed.moods) ? parsed.moods : [],
      intensity: typeof parsed.intensity === "number" ? parsed.intensity : 3,
      note: typeof parsed.note === "string" ? parsed.note : "",
    };
  } catch {
    return { ...EMPTY_VIBE };
  }
}

export function formatVibeHuman(v: Vibe): string {
  const parts: string[] = [];
  if (v.moods.length > 0) parts.push(v.moods.join(", "));
  parts.push(`Intensity ${v.intensity}/5 · ${INTENSITY_LABELS[v.intensity - 1] ?? ""}`.trim());
  if (v.note.trim()) parts.push(v.note.trim());
  return parts.join(" — ");
}

// ---------- Chip-array serialization ----------
//
// Used for setting, dress, timeConstraints, substances, medicalConcerns,
// partnerDynamics. Stored as comma-joined string.

export function encodeChips(chips: string[], note?: string): string {
  const clean = chips.map((c) => c.trim()).filter(Boolean);
  const base = clean.join(", ");
  const n = note?.trim();
  if (n) return base ? `${base} — ${n}` : n;
  return base;
}

export function decodeChips(raw: string | undefined | null, vocab: string[]): { chips: string[]; note: string } {
  if (!raw?.trim()) return { chips: [], note: "" };
  // split off optional " — note" tail
  const [head, ...rest] = raw.split(" — ");
  const tail = rest.join(" — ").trim();
  const tokens = head.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
  const chips: string[] = [];
  const noteParts: string[] = [];
  for (const t of tokens) {
    if (vocab.includes(t)) chips.push(t);
    else noteParts.push(t); // unknown tokens become part of note
  }
  const note = [noteParts.join(", "), tail].filter(Boolean).join(" — ");
  return { chips, note };
}
