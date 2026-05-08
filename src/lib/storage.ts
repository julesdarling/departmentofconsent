import { useEffect, useState, useCallback, useRef } from "react";
import { nanoid } from "nanoid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/useAuth";

// ===== Types =====

export type Rating = "yes" | "maybe" | "no" | "unsure";
export type Direction = "give" | "receive" | "both";
export type KinkDirections = Record<string, Direction>;

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
  healthcare: string;
  emergencyContact: string;
  partnerDynamics: string;
  timeConstraints: string;
  medicalConcerns: string;
  substances: string;
  substancesHardLimit: boolean;
  setting: string;
  music: string;
  dress: string;
  callMe: string;
  dontCallMe: string;
  intentions: string;
  goodTime: string;
  badTime: string;
  privacy: string;
  penetrativeSex: string;
  safewords: string;
  vision: string;
  selectedKinks: string[];
  actions: string;
  hardLimits: string;
  softLimits: string;
  yesList: string;
  aftercare: string;
  brainstorm: string;
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
  partnerSides?: SessionSide[];
  reflection?: string;
  aftercareCompleted?: string[];
}

// ===== Defaults =====

export const DEFAULT_KINKS: KinkItem[] = [
  // Intimacy
  { id: "k_handstuff", name: "Hand stuff", category: "Intimacy" },
  { id: "k_kissing", name: "Kissing", category: "Intimacy" },
  { id: "k_cock_sucking", name: "Cock sucking", category: "Intimacy" },
  { id: "k_pussy_eating", name: "Pussy eating", category: "Intimacy" },
  { id: "k_fucking", name: "Fucking", category: "Intimacy" },
  { id: "k_anal", name: "Anal play", category: "Intimacy" },
  { id: "k_toys", name: "Toys", category: "Intimacy" },

  // Sensation
  { id: "k_sensation", name: "Sensation", category: "Sensation" },
  { id: "k_temp", name: "Temperature play (ice/wax)", category: "Sensation" },
  { id: "k_scratch", name: "Scratching", category: "Sensation" },
  
  { id: "k_bite", name: "Biting", category: "Sensation" },
  { id: "k_tickle", name: "Tickling", category: "Sensation" },
  { id: "k_pinch", name: "Pinching", category: "Sensation" },
  { id: "k_ear_licking", name: "Ear licking", category: "Sensation" },
  { id: "k_electro", name: "Electro", category: "Sensation" },

  // Impact
  { id: "k_impact", name: "Impact", category: "Impact" },
  { id: "k_spank_hand", name: "Spanking (hand)", category: "Impact" },
  { id: "k_paddle", name: "Paddling", category: "Impact" },
  { id: "k_flog", name: "Flogging", category: "Impact" },
  { id: "k_cane", name: "Caning", category: "Impact" },
  { id: "k_slap_face", name: "Face slapping", category: "Impact" },
  { id: "k_whipping", name: "Whipping", category: "Impact" },
  { id: "k_body_punching", name: "Body punching", category: "Impact" },
  { id: "k_face_punching", name: "Face punching", category: "Impact" },

  // Bondage
  { id: "k_rope", name: "Rope bondage", category: "Bondage" },
  { id: "k_cuffs", name: "Cuffs / restraints", category: "Bondage" },
  { id: "k_blindfold", name: "Blindfold", category: "Bondage" },
  { id: "k_gag", name: "Gag", category: "Bondage" },
  { id: "k_collar", name: "Collar / leash", category: "Bondage" },
  { id: "k_grabbing", name: "Grabbing / restraining", category: "Bondage" },
  { id: "k_hand_mouth", name: "Hand over mouth", category: "Bondage" },
  { id: "k_saran_wrap", name: "Saran Wrap", category: "Bondage" },

  // Power exchange
  { id: "k_dom", name: "Dominance", category: "Power exchange" },
  { id: "k_sub", name: "Submission", category: "Power exchange" },
  { id: "k_brat", name: "Brat / bratty play", category: "Power exchange" },
  { id: "k_service", name: "Service", category: "Power exchange" },
  { id: "k_humil", name: "Humiliation (light)", category: "Power exchange" },
  { id: "k_degrade", name: "Degradation", category: "Power exchange" },
  { id: "k_praise", name: "Praise", category: "Power exchange" },

  // Sensory
  { id: "k_sensory_dep", name: "Sensory deprivation", category: "Sensory" },
  { id: "k_overstim", name: "Overstimulation", category: "Sensory" },

  // Roleplay
  { id: "k_role_age", name: "Age play (adult)", category: "Roleplay" },
  { id: "k_ageplay_girl", name: "Ageplay / Little girl", category: "Roleplay" },
  { id: "k_role_pet", name: "Pet play", category: "Roleplay" },
  { id: "k_role_primal", name: "Primal play", category: "Roleplay" },
  { id: "k_fuckdoll", name: "Fuckdoll roleplay", category: "Roleplay" },

  // Edge / Taboo
  { id: "k_breath", name: "Breath play", category: "Edge" },
  { id: "k_choking", name: "Choking and strangulation", category: "Edge" },
  { id: "k_knife", name: "Knife / edge play", category: "Edge" },
  { id: "k_blood", name: "Blood play", category: "Edge" },
  { id: "k_fire", name: "Fire play", category: "Edge" },
  { id: "k_fingers_throat", name: "Fingers down throat", category: "Edge" },
  { id: "k_spitting", name: "Spitting", category: "Edge" },
  { id: "k_throat_fucking", name: "Throat fucking", category: "Edge" },
  { id: "k_deepthroat_training", name: "Deepthroat training", category: "Edge" },
  { id: "k_tit_torture", name: "Tit torture", category: "Edge" },
  { id: "k_pussy_torture", name: "Pussy torture", category: "Edge" },
  { id: "k_orgasm_control", name: "Orgasm control", category: "Edge" },
  { id: "k_hypno", name: "Hypno", category: "Edge" },
  { id: "k_unconscious", name: "Unconscious play and fucking", category: "Edge" },
  { id: "k_cnc", name: "Cnc / rape play", category: "Edge" },
  { id: "k_incest", name: "Incest play", category: "Edge" },
  { id: "k_molestation", name: "Molestation", category: "Edge" },
  { id: "k_pissing", name: "Pissing", category: "Edge" },
  { id: "k_pacifier", name: "Pacifier", category: "Edge" },
  { id: "k_vomitting", name: "Vomitting from throat fucking", category: "Edge" },
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

// ===== Cloud-backed profile row =====

interface ProfileRow {
  user_id: string;
  name: string;
  pronouns: string;
  call_me: string;
  dont_call_me: string;
  healthcare: string;
  emergency_contact: string;
  default_aftercare: string;
  default_safewords: string;
  kinks_library: KinkItem[];
  kink_ratings: KinkRatings;
  kink_directions: KinkDirections;
}

function rowToProfile(r: ProfileRow | null | undefined): Profile {
  if (!r) return emptyProfile;
  return {
    name: r.name ?? "",
    pronouns: r.pronouns ?? "",
    callMe: r.call_me ?? "",
    dontCallMe: r.dont_call_me ?? "",
    healthcare: r.healthcare ?? "",
    emergencyContact: r.emergency_contact ?? "",
    defaultAftercare: r.default_aftercare ?? "",
    defaultSafewords: r.default_safewords?.trim() ? r.default_safewords : DEFAULT_SAFEWORDS,
  };
}

function profileToRow(p: Profile): Partial<ProfileRow> {
  return {
    name: p.name,
    pronouns: p.pronouns,
    call_me: p.callMe,
    dont_call_me: p.dontCallMe,
    healthcare: p.healthcare,
    emergency_contact: p.emergencyContact,
    default_aftercare: p.defaultAftercare,
    default_safewords: p.defaultSafewords,
  };
}

function useProfileRow() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const userId = user?.id;
  const query = useQuery({
    queryKey: ["profile-row", userId],
    enabled: !!userId,
    queryFn: async (): Promise<ProfileRow | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as ProfileRow) ?? null;
    },
  });
  return { row: query.data ?? null, userId, loading: loading || query.isLoading, qc };
}

async function patchProfileRow(userId: string, patch: Partial<ProfileRow>) {
  // Try update first, fall back to insert if no row exists yet.
  const p = patch as Record<string, unknown>;
  const { data, error } = await supabase
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(p as any)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: inserted, error: insertErr } = await supabase
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ user_id: userId, ...p } as any)
    .select()
    .single();
  if (insertErr) throw insertErr;
  return inserted;
}

// Generic helper: optimistic local state synced to server with debounced patch
function useCloudField<T>(
  derive: (row: ProfileRow | null) => T,
  toPatch: (value: T) => Partial<ProfileRow>,
  fallback: T
) {
  const { row, userId, qc } = useProfileRow();
  const [local, setLocal] = useState<T>(() => (row ? derive(row) : fallback));
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current && row) {
      setLocal(derive(row));
      hydrated.current = true;
    }
  }, [row, derive]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setLocal((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        if (!userId) return v;
        const patch = toPatch(v);
        // Optimistic update of cached row
        qc.setQueryData(["profile-row", userId], (old: ProfileRow | null | undefined) => ({
          ...(old ?? { user_id: userId }),
          ...patch,
        }) as ProfileRow);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          patchProfileRow(userId, patch).catch((e) => console.error("profile save failed", e));
        }, 350);
        return v;
      });
    },
    [userId, qc, toPatch]
  );

  return [local, update] as const;
}

// ===== Public hooks =====

export function useProfile() {
  const derive = useCallback((r: ProfileRow | null) => rowToProfile(r), []);
  const toPatch = useCallback((p: Profile) => profileToRow(p), []);
  return useCloudField<Profile>(derive, toPatch, emptyProfile);
}

const REMOVED_KINK_IDS = new Set([
  "k_pen_giving",
  "k_pen_recv",
  "k_oral_giving",
  "k_oral_recv",
  "k_oral_receiving",
]);
const REMOVED_KINK_NAMES = new Set([
  "penetrative (giving)",
  "penetrative (receiving)",
  "oral (giving)",
  "oral (receiving)",
]);

export function useKinks() {
  const derive = useCallback((r: ProfileRow | null): KinkItem[] => {
    const arr = r?.kinks_library;
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.filter(
        (k) => !REMOVED_KINK_IDS.has(k.id) && !REMOVED_KINK_NAMES.has(k.name?.toLowerCase?.() ?? "")
      );
    }
    return DEFAULT_KINKS;
  }, []);
  const toPatch = useCallback((v: KinkItem[]) => ({ kinks_library: v }), []);
  return useCloudField<KinkItem[]>(derive, toPatch, DEFAULT_KINKS);
}

export function useRatings() {
  const derive = useCallback((r: ProfileRow | null): KinkRatings => r?.kink_ratings ?? {}, []);
  const toPatch = useCallback((v: KinkRatings) => ({ kink_ratings: v }), []);
  return useCloudField<KinkRatings>(derive, toPatch, {});
}

export function useDirections() {
  const derive = useCallback((r: ProfileRow | null): KinkDirections => r?.kink_directions ?? {}, []);
  const toPatch = useCallback((v: KinkDirections) => ({ kink_directions: v }), []);
  return useCloudField<KinkDirections>(derive, toPatch, {});
}

// ===== Participant id (per-browser, used inside a session side payload only) =====

const KEY_PARTICIPANT = "doc_participant_id";

export function getParticipantId(): string {
  if (typeof window === "undefined") return "";
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

// ===== Cloud-backed sessions list =====

export interface SessionSummary {
  id: string;
  shareToken: string;
  partnerHandle: string;
  date: string;
  createdAt: string;
  role: "owner" | "partner";
  status: SessionStatus;
}

export function useMySessions() {
  const { user } = useAuth();
  const userId = user?.id;
  const query = useQuery({
    queryKey: ["my-sessions", userId],
    enabled: !!userId,
    queryFn: async (): Promise<SessionSummary[]> => {
      const { data, error } = await supabase.rpc("list_my_play_sessions");
      if (error) throw error;
      const rows = (data ?? []) as Array<{
        id: string;
        share_token: string;
        partner_handle: string;
        date: string;
        status: string;
        created_at: string;
        owner_user_id: string | null;
      }>;
      return rows.map((r) => ({
        id: r.id,
        shareToken: r.share_token,
        partnerHandle: r.partner_handle,
        date: r.date,
        createdAt: r.created_at,
        role: r.owner_user_id === userId ? "owner" : "partner",
        status: r.status as SessionStatus,
      }));
    },
  });
  return query;
}
