import { useEffect, useState, useCallback } from "react";
import { nanoid } from "nanoid";

// ===== Types =====

export type Rating = "yes" | "maybe" | "no" | "unsure";

export interface Profile {
  name: string;
  pronouns: string;
  callMe: string;
  dontCallMe: string;
  healthcare: string;
  emergencyContact: string;
  defaultAftercare: string;
  defaultSafewords: string;
}

export interface KinkItem {
  id: string;
  name: string;
  category: string;
  custom?: boolean;
}

export type KinkRatings = Record<string, Rating>;

export interface SessionSide {
  participantId: string;
  name: string;
  pronouns: string;
  filledAt?: string;
  // logistics
  healthcare: string;
  emergencyContact: string;
  partnerDynamics: string;
  timeConstraints: string;
  medicalConcerns: string;
  substances: string;
  substancesHardLimit: boolean;
  // scene
  setting: string;
  music: string;
  dress: string;
  callMe: string;
  dontCallMe: string;
  intentions: string;
  goodTime: string;
  badTime: string;
  // privacy
  privacy: string;
  // sex
  penetrativeSex: string;
  // safewords
  safewords: string;
  // tonight's vision
  vision: string;
  selectedKinks: string[];
  // free text
  actions: string;
  hardLimits: string;
  softLimits: string;
  yesList: string;
  aftercare: string;
  brainstorm: string;
  // ratings
  ratings: KinkRatings;
}

export type SessionStatus = "draft" | "shared" | "agreed" | "completed";

export interface PlaySession {
  id: string;
  shareToken: string;
  partnerHandle: string;
  date: string;
  createdAt: string;
  status: SessionStatus;
  ownerSide: SessionSide;
  partnerSide?: SessionSide;
  reflection?: string;
  aftercareCompleted?: string[];
}

// ===== Default kink library =====

export const DEFAULT_KINKS: KinkItem[] = [
  // sensation
  { id: "k_temp", name: "Temperature play (ice/wax)", category: "Sensation" },
  { id: "k_scratch", name: "Scratching", category: "Sensation" },
  { id: "k_bite", name: "Biting", category: "Sensation" },
  { id: "k_tickle", name: "Tickling", category: "Sensation" },
  { id: "k_pinch", name: "Pinching", category: "Sensation" },
  // impact
  { id: "k_spank_hand", name: "Spanking (hand)", category: "Impact" },
  { id: "k_paddle", name: "Paddling", category: "Impact" },
  { id: "k_flog", name: "Flogging", category: "Impact" },
  { id: "k_cane", name: "Caning", category: "Impact" },
  { id: "k_slap_face", name: "Face slapping", category: "Impact" },
  // bondage
  { id: "k_rope", name: "Rope bondage", category: "Bondage" },
  { id: "k_cuffs", name: "Cuffs / restraints", category: "Bondage" },
  { id: "k_blindfold", name: "Blindfold", category: "Bondage" },
  { id: "k_gag", name: "Gag", category: "Bondage" },
  { id: "k_collar", name: "Collar / leash", category: "Bondage" },
  // power
  { id: "k_dom", name: "Dominance", category: "Power exchange" },
  { id: "k_sub", name: "Submission", category: "Power exchange" },
  { id: "k_brat", name: "Brat / bratty play", category: "Power exchange" },
  { id: "k_service", name: "Service", category: "Power exchange" },
  { id: "k_humil", name: "Humiliation (light)", category: "Power exchange" },
  { id: "k_degrade", name: "Degradation", category: "Power exchange" },
  { id: "k_praise", name: "Praise", category: "Power exchange" },
  // sensory
  { id: "k_sensory_dep", name: "Sensory deprivation", category: "Sensory" },
  { id: "k_overstim", name: "Overstimulation", category: "Sensory" },
  // roleplay
  { id: "k_role_age", name: "Age play (adult)", category: "Roleplay" },
  { id: "k_role_pet", name: "Pet play", category: "Roleplay" },
  { id: "k_role_primal", name: "Primal play", category: "Roleplay" },
  // fluids/sex
  { id: "k_kissing", name: "Kissing", category: "Intimacy" },
  { id: "k_oral_give", name: "Oral (giving)", category: "Intimacy" },
  { id: "k_oral_recv", name: "Oral (receiving)", category: "Intimacy" },
  { id: "k_handstuff", name: "Hand stuff", category: "Intimacy" },
  { id: "k_toys", name: "Toys", category: "Intimacy" },
  { id: "k_anal", name: "Anal play", category: "Intimacy" },
  { id: "k_pen_giving", name: "Penetrative (giving)", category: "Intimacy" },
  { id: "k_pen_recv", name: "Penetrative (receiving)", category: "Intimacy" },
  // edge
  { id: "k_breath", name: "Breath play", category: "Edge" },
  { id: "k_knife", name: "Knife / edge play", category: "Edge" },
  { id: "k_blood", name: "Blood play", category: "Edge" },
  { id: "k_fire", name: "Fire play", category: "Edge" },
];

export const DEFAULT_SAFEWORDS = `Verbal:
Red — stop the scene, something is wrong and we can't continue.
Yellow — check in.
Green — good, keep going.
Mercy — no more on the same spot.

Non-verbal:
Thumb up — keep going.
Enthusiastic thumb up — more more more please.
Thumb side — right here is good, no more no less.
Thumb down, double tap — check in please.`;

// ===== Storage =====

const KEY_PROFILE = "doc_profile";
const KEY_KINKS = "doc_kinks";
const KEY_RATINGS = "doc_ratings";
const KEY_SESSIONS = "doc_sessions";
const KEY_PARTICIPANT = "doc_participant_id";

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("doc-storage", { detail: key }));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(read(key, fallback));
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      if (ce.detail === key) setValue(read(key, fallback));
    };
    window.addEventListener("doc-storage", handler);
    return () => window.removeEventListener("doc-storage", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, v);
        return v;
      });
    },
    [key]
  );
  return [value, update] as const;
}

export const emptyProfile: Profile = {
  name: "",
  pronouns: "",
  callMe: "",
  dontCallMe: "",
  healthcare: "",
  emergencyContact: "",
  defaultAftercare: "",
  defaultSafewords: DEFAULT_SAFEWORDS,
};

export function useProfile() {
  return useStored<Profile>(KEY_PROFILE, emptyProfile);
}

export function useKinks() {
  return useStored<KinkItem[]>(KEY_KINKS, DEFAULT_KINKS);
}

export function useRatings() {
  return useStored<KinkRatings>(KEY_RATINGS, {});
}

// Local index of sessions this device has created/joined.
// The actual session content lives in the cloud, keyed by share_token.
export interface SessionIndexEntry {
  id: string;
  shareToken: string;
  partnerHandle: string;
  date: string;
  createdAt: string;
  role: "owner" | "partner";
}

export function useSessionIndex() {
  return useStored<SessionIndexEntry[]>(KEY_SESSIONS, []);
}

export function getParticipantId(): string {
  if (!isBrowser) return "";
  let id = localStorage.getItem(KEY_PARTICIPANT);
  if (!id) {
    id = nanoid(10);
    localStorage.setItem(KEY_PARTICIPANT, id);
  }
  return id;
}

export function emptySide(profile?: Profile, ratings?: KinkRatings): SessionSide {
  return {
    participantId: getParticipantId(),
    name: profile?.name ?? "",
    pronouns: profile?.pronouns ?? "",
    healthcare: profile?.healthcare ?? "",
    emergencyContact: profile?.emergencyContact ?? "",
    partnerDynamics: "",
    timeConstraints: "",
    medicalConcerns: "",
    substances: "",
    substancesHardLimit: false,
    setting: "",
    music: "",
    dress: "",
    callMe: profile?.callMe ?? "",
    dontCallMe: profile?.dontCallMe ?? "",
    intentions: "",
    goodTime: "",
    badTime: "",
    privacy: "",
    penetrativeSex: "",
    safewords: profile?.defaultSafewords ?? DEFAULT_SAFEWORDS,
    vision: "",
    selectedKinks: [],
    actions: "",
    hardLimits: "",
    softLimits: "",
    yesList: "",
    aftercare: profile?.defaultAftercare ?? "",
    brainstorm: "",
    ratings: ratings ? { ...ratings } : {},
  };
}

export function newSession(profile: Profile, ratings: KinkRatings, partnerHandle = ""): PlaySession {
  return {
    id: nanoid(12),
    shareToken: nanoid(16),
    partnerHandle,
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    status: "draft",
    ownerSide: emptySide(profile, ratings),
    aftercareCompleted: [],
  };
}
