import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCloudSession } from "@/lib/useCloudSession";
import { useProfile, useKinks } from "@/lib/storage";
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

  if (session === undefined) return <Layout><Sticker>Loading…</Sticker></Layout>;
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

        {(() => {
          const sides = [
            { name: ownerName, side: o },
            ...partners.map((p, i) => ({
              name: p.name?.trim() || `Play partner ${i + 1}`,
              side: p,
            })),
          ];
          const kinkMap = Object.fromEntries(kinks.map((k) => [k.id, k.name]));
          const allKinkIds = Array.from(
            new Set(sides.flatMap((s) => Object.keys(s.side.ratings || {})))
          );
          const agreed = allKinkIds.filter(
            (id) => sides.length >= 2 && sides.every((s) => s.side.ratings?.[id] === "yes")
          );
          if (agreed.length === 0) return null;
          return (
            <Sticker variant="coral" className="space-y-3">
              <div className="text-center font-display text-2xl text-plum">Agreed kinks</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {agreed.map((id) => (
                  <span
                    key={id}
                    className="inline-block bg-yes/25 border-2 border-yes text-plum font-display text-2xl sm:text-3xl rounded-lg px-4 py-2 leading-tight"
                  >
                    {kinkMap[id] || id}
                  </span>
                ))}
              </div>
            </Sticker>
          );
        })()}

        {(() => {
          const kinkMap = Object.fromEntries(kinks.map((k) => [k.id, k.name]));
          const sides = [
            { name: ownerName, side: o },
            ...partners.map((p, i) => ({
              name: p.name?.trim() || `Play partner ${i + 1}`,
              side: p,
            })),
          ];
          const perPerson = sides
            .map((s) => ({
              name: s.name,
              yeses: Object.entries(s.side.ratings || {})
                .filter(([, v]) => v === "yes")
                .map(([id]) => kinkMap[id] || id),
            }))
            .filter((s) => s.yeses.length > 0);
          if (perPerson.length === 0) return null;
          return (
            <Sticker className="space-y-3">
              <div className="section-label">Each participant's yeses</div>
              {perPerson.map((p, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-sm font-semibold text-plum">{p.name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.yeses.map((y) => (
                      <span
                        key={y}
                        className="inline-block bg-yes/20 border border-yes text-plum text-sm rounded-md px-2 py-0.5"
                      >
                        {y}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Sticker>
          );
        })()}

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

        {(() => {
          const sides = [
            { name: ownerName, side: o },
            ...partners.map((p, i) => ({
              name: p.name?.trim() || `Play partner ${i + 1}`,
              side: p,
            })),
          ];
          const anyHas = sides.some(
            (s) => (s.side.safewordItems?.length ?? 0) > 0 || s.side.safewords?.trim()
          );
          if (!anyHas) return null;
          return (
            <Sticker variant="coral" className="space-y-3">
              <div className="section-label">Safewords</div>
              {sides.map((s, i) => {
                const items = s.side.safewordItems ?? [];
                const free = s.side.safewords?.trim();
                if (items.length === 0 && !free) return null;
                return (
                  <div key={i} className="space-y-1">
                    <div className="text-sm font-semibold text-plum">{s.name}</div>
                    {items.length > 0 && (
                      <ul className="space-y-0.5 ml-1">
                        {items.map((item) => (
                          <li key={item} className="text-sm text-plum">{item}</li>
                        ))}
                      </ul>
                    )}
                    {free && (
                      <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed ml-1">{free}</pre>
                    )}
                  </div>
                );
              })}
            </Sticker>
          );
        })()}

        {o.hardLimits && (
          <Sticker className="border-no">
            <div className="section-label" style={{ color: "var(--color-no)" }}>Hard limits</div>
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
