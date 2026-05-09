import { WhipLoader } from "@/components/WhipLoader";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCloudSession } from "@/lib/useCloudSession";
import { DEFAULT_SAFEWORD_ITEMS, useProfile, useKinks, type SessionSide } from "@/lib/storage";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/sessions/$sessionId/scene")({
  head: () => ({ meta: [{ title: "In-scene reference" }] }),
  component: () => <RequireAuth><ScenePage /></RequireAuth>,
});

function ScenePage() {
  const { sessionId } = Route.useParams();
  const { session, update } = useCloudSession(sessionId);
  const [profile] = useProfile();
  const [kinks] = useKinks();
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session && session.reflection !== undefined) {
      setNotes(session.reflection ?? "");
      setSavedNotes(session.reflection ?? "");
    }
  }, [session]);

  if (session === undefined) return <Layout><Sticker className="flex justify-center"><WhipLoader /></Sticker></Layout>;
  if (!session) return <Layout><Sticker>Not found.</Sticker></Layout>;

  const o = session.ownerSide;
  const partners = session.partnerSides ?? (session.partnerSide ? [session.partnerSide] : []);
  const ownerName = o.name?.trim() || profile?.name?.trim() || "Unnamed";

  const participants = [
    { name: ownerName, pronouns: o.pronouns, role: "Creator" },
    ...partners.map((p, i) => ({
      name: p.name?.trim() || `Play partner ${i + 1}`,
      pronouns: p.pronouns,
      role: "Partner",
    })),
  ];

  const sceneSides = [
    { name: ownerName, side: o },
    ...partners.map((p, i) => ({
      name: p.name?.trim() || `Play partner ${i + 1}`,
      side: p,
    })),
  ];

  const safewordItemsFor = (side: SessionSide) => {
    const explicit = (side.safewordItems ?? []).map((item) => item.trim()).filter(Boolean);
    if (explicit.length > 0) return explicit;

    const legacy = (side.safewords ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return legacy.length > 0 ? legacy : DEFAULT_SAFEWORD_ITEMS;
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await update({ reflection: notes });
      setSavedNotes(notes);
      toast.success("Notes saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="text-center">
          <h1 className="font-display text-3xl text-plum">In-scene card</h1>
          <p className="text-sm text-muted-foreground">{session.partnerHandle} · {session.date}</p>
        </div>

        {(() => {
          const sides = sceneSides;
          if (sides.length < 2) return null;
          const kinkMap = Object.fromEntries(kinks.map((k) => [k.id, k.name]));
          const allKinkIds = Array.from(
            new Set(sides.flatMap((s) => Object.keys(s.side.ratings || {})))
          );
          const bothPlay: string[] = [];
          const discuss: string[] = [];
          const hardLimit: string[] = [];
          const allSelected = sides.map((s) => new Set(s.side.selectedKinks ?? []));
          for (const id of allKinkIds) {
            const ratings = sides.map((s) => s.side.ratings?.[id]);
            const name = kinkMap[id] || id;
            const hasNo = ratings.includes("no");
            const hasYesOrMaybe = ratings.some((r) => r === "yes" || r === "maybe");
            if (hasNo && hasYesOrMaybe) {
              hardLimit.push(name);
            } else if (
              ratings.every((r) => r === "yes") &&
              allSelected.every((s) => s.has(id))
            ) {
              bothPlay.push(name);
            } else if (
              !hasNo &&
              ratings.every((r) => r === "yes" || r === "maybe") &&
              ratings.some((r) => r === "maybe")
            ) {
              discuss.push(name);
            }
          }
          if (bothPlay.length + discuss.length + hardLimit.length === 0) return null;
          const pillBase =
            "inline-block font-display text-2xl sm:text-3xl rounded-lg px-4 py-2 leading-tight border-2";
          return (
            <Sticker className="space-y-5">
              {bothPlay.length > 0 && (
                <div className="space-y-2">
                  <div className="text-base font-bold uppercase tracking-wider text-yes">
                    Both want to play
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cravings everyone picked for this scene.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {bothPlay.map((n) => (
                      <span key={n} className={`${pillBase} bg-yes/25 border-yes text-plum`}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {discuss.length > 0 && (
                <div className="space-y-2">
                  <div className="text-base font-bold uppercase tracking-wider text-maybe">
                    Discuss
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {discuss.map((n) => (
                      <span key={n} className={`${pillBase} bg-maybe/25 border-maybe text-plum`}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hardLimit.length > 0 && (
                <div className="space-y-2">
                  <div className="text-base font-bold uppercase tracking-wider text-plum">
                    Hard limit from one side
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {hardLimit.map((n) => (
                      <span key={n} className={`${pillBase} bg-no/20 border-no text-plum`}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Sticker>
          );
        })()}

        <Sticker className="space-y-2">
          <div className="section-label">Who's playing</div>
          <ul className="space-y-1">
            {participants.map((p, i) => (
              <li key={i} className="text-sm">
                <span className="text-muted-foreground">{p.role} · </span>
                <span className="font-semibold text-plum">{p.name}</span>
                {p.pronouns && <span className="text-muted-foreground"> · {p.pronouns}</span>}
              </li>
            ))}
          </ul>
        </Sticker>

        {(o.vision || partners.some((p) => p.vision)) && (
          <Sticker className="space-y-3">
            {o.vision && (
              <div>
                <div className="section-label">{ownerName}'s vision for the scene</div>
                <p className="text-sm whitespace-pre-wrap">{o.vision}</p>
              </div>
            )}
            {partners.map((ps, i) => ps.vision && (
              <div key={i}>
                <div className="section-label">
                  {(ps.name?.trim() || `Play partner ${i + 1}`)}'s vision for the scene
                </div>
                <p className="text-sm whitespace-pre-wrap">{ps.vision}</p>
              </div>
            ))}
          </Sticker>
        )}

        <Sticker variant="coral" className="space-y-4">
          <div className="section-label">Safewords</div>
          {sceneSides.map((s, i) => {
            const items = safewordItemsFor(s.side);
            return (
              <div key={i} className="space-y-2">
                <div className="text-sm font-semibold text-plum">{s.name}</div>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item} className="text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Sticker>

        {o.hardLimits && (
          <Sticker className="border-no">
            <div className="section-label">Hard limits</div>
            <div className="text-base whitespace-pre-wrap font-semibold">{o.hardLimits}</div>
          </Sticker>
        )}

        {o.dontCallMe && (
          <Sticker>
            <div className="section-label">Don't call me</div>
            <div className="text-base font-semibold">{o.dontCallMe}</div>
          </Sticker>
        )}

        {o.emergencyContact && (
          <Sticker variant="coral">
            <div className="section-label flex items-center gap-1">
              <Phone className="h-3 w-3" /> Emergency contact
            </div>
            <div className="text-base whitespace-pre-wrap">{o.emergencyContact}</div>
          </Sticker>
        )}

        <Sticker className="space-y-2">
          <div className="section-label">Notes</div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Jot down notes during or after the scene…"
          />
          <div className="flex justify-center">
            <Button size="sm" onClick={saveNotes} disabled={saving || notes === savedNotes}>
              {saving ? "Saving…" : "Save notes"}
            </Button>
          </div>
        </Sticker>

        <div className="flex justify-center pt-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/sessions/$sessionId" params={{ sessionId }}>Back</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
