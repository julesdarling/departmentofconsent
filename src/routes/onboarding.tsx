import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { CloudButton } from "@/components/CloudButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/lib/storage";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { useServerFn } from "@tanstack/react-start";
import { deleteOwnAccount } from "@/lib/account.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your profile — Department of Consent" }] }),
  component: () => <RequireAuth><Onboarding /></RequireAuth>,
});

function Onboarding() {
  const [profile, setProfile] = useProfile();
  const [draft, setDraft] = useState(profile);
  const syncedRef = useRef(false);
  // Hydrate the draft once the stored profile has loaded from storage.
  useEffect(() => {
    if (syncedRef.current) return;
    const hasAny =
      profile.name || profile.pronouns || profile.callMe || profile.dontCallMe ||
      profile.healthcare || profile.emergencyContact || profile.defaultAftercare;
    if (hasAny) {
      setDraft(profile);
      syncedRef.current = true;
    }
  }, [profile]);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { isActive } = useSubscription();
  const deleteFn = useServerFn(deleteOwnAccount);

  const [showCancel, setShowCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFn();
      try { localStorage.clear(); } catch { /* ignore */ }
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      alert((err as Error).message || "Could not delete account.");
      setDeleting(false);
    }
  };

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((p) => ({ ...p, [key]: value }));

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center pt-2">
          <h1 className="font-display text-5xl text-foreground tracking-tight">
            Tell us about you
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Saved to your account. You can change anything later.
          </p>
        </div>

        <Sticker className="space-y-4">
          <Field label="Name (or handle)">
            <Input value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="What we'll call you" />
          </Field>
          <Field label="Pronouns">
            <Input value={draft.pronouns} onChange={(e) => update("pronouns", e.target.value)} placeholder="she/her, they/them, etc." />
          </Field>
          <Field label="Names you love being called">
            <Input value={draft.callMe} onChange={(e) => update("callMe", e.target.value)} placeholder="goddess, princess, sir..." />
          </Field>
          <Field label="Names that are off-limits">
            <Input value={draft.dontCallMe} onChange={(e) => update("dontCallMe", e.target.value)} />
          </Field>
        </Sticker>

        <Sticker className="space-y-4">
          <Field label="In case something goes wrong, do you have health care?">
            <Input value={draft.healthcare} onChange={(e) => update("healthcare", e.target.value)} placeholder="yes, insured / specify hospital" />
          </Field>
          <Field label="Emergency contact">
            <Input value={draft.emergencyContact} onChange={(e) => update("emergencyContact", e.target.value)} placeholder="Name and phone" />
          </Field>
          <Field label="Default aftercare needs">
            <Textarea value={draft.defaultAftercare} onChange={(e) => update("defaultAftercare", e.target.value)} placeholder="Cuddles, water, snacks, alone time, check-in tomorrow..." rows={3} />
          </Field>
        </Sticker>

        <Sticker className="space-y-2">
          <div className="doc-label">Your default safewords</div>
          <p className="text-xs text-muted-foreground -mt-1">Pre-filled with a common set. Edit to taste.</p>
          <Textarea value={draft.defaultSafewords} onChange={(e) => update("defaultSafewords", e.target.value)} rows={14} className="font-mono text-xs" />
        </Sticker>

        <div className="flex justify-center pt-2">
          <CloudButton
            onClick={() => {
              setProfile(draft);
              navigate({ to: "/kinks" });
            }}
            className="cloud-btn-fluid"
          >
            Save and continue
          </CloudButton>
        </div>

        {user && (
          <Sticker className="space-y-3 text-center">
            <div className="font-display text-base text-plum">Account</div>
            <p className="text-xs text-muted-foreground">Signed in as {user.email}</p>
            <div className="flex flex-col items-center gap-3 pt-2">
              <Link to="/settings" className="text-sm text-coral underline underline-offset-4 hover:opacity-80">
                More account settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-coral underline underline-offset-4 hover:opacity-80"
              >
                Log out
              </button>
              <button
                onClick={() => setShowCancel(true)}
                className="text-sm text-coral underline underline-offset-4 hover:opacity-80"
              >
                Cancel my subscription
              </button>
              <button
                onClick={() => { setConfirmText(""); setShowDelete(true); }}
                className="text-sm font-semibold text-destructive underline underline-offset-4 hover:opacity-80"
              >
                Delete my account
              </button>
            </div>
          </Sticker>
        )}
      </div>

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your subscription</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                {isActive ? (
                  <>
                    <p>To cancel your subscription:</p>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>Email <span className="font-semibold">support@departmentofconsent.com</span> from the address you used to sign up.</li>
                      <li>Include the subject line "Cancel subscription".</li>
                      <li>We'll cancel and confirm via email within 1–2 business days.</li>
                    </ol>
                    <p className="text-xs text-muted-foreground">
                      You'll keep access through the end of your current billing period.
                    </p>
                  </>
                ) : (
                  <p>You don't currently have an active subscription on this account.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDelete} onOpenChange={(o) => { setShowDelete(o); if (!o) setConfirmText(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  This permanently deletes your account, profile, and on-device data. Active
                  subscriptions are not automatically refunded — cancel first if needed.
                </p>
                <p>Type <span className="font-mono font-bold">DELETE</span> to confirm.</p>
                <input
                  className="doc-input"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmText !== "DELETE" || deleting}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="doc-label">{label}</Label>
      {children}
    </div>
  );
}
