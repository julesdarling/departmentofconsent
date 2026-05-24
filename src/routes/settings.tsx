import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { Button } from "@/components/ui/button";
import { useProfile, emptyProfile } from "@/lib/storage";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { invokeEdgeFunction } from "@/lib/edge-functions";
import { withBasePath } from "@/lib/app-url";
import { useState } from "react";
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

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Profile & settings" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useProfile();
  const { signOut, user } = useAuth();
  const { isActive } = useSubscription();
  const navigate = useNavigate();

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
      await invokeEdgeFunction("delete-own-account");
      await supabase.auth.signOut();
      window.location.href = withBasePath("/");
    } catch (err) {
      alert((err as Error).message || "Could not delete account.");
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="font-display text-3xl text-plum text-center">Profile</h1>

        <Sticker className="space-y-2">
          <Row label="Name" value={profile.name} />
          <Row label="Pronouns" value={profile.pronouns} />
          <Row label="Call me" value={profile.callMe} />
          <Row label="Don't call me" value={profile.dontCallMe} />
          <Row label="Healthcare" value={profile.healthcare} />
          <Row label="Emergency contact" value={profile.emergencyContact} />
          <Row label="Default aftercare" value={profile.defaultAftercare} />
          <div className="flex flex-col items-center gap-3 pt-2">
            <Button asChild>
              <Link to="/onboarding">Edit profile</Link>
            </Button>
            <Link
              to="/kinks"
              className="text-sm text-link underline underline-offset-4 hover:opacity-80"
            >
              Edit kinks
            </Link>
          </div>
        </Sticker>

        <Sticker variant="coral" className="space-y-2">
          <h2 className="font-display text-plum text-center font-normal text-3xl">Your data</h2>
          <p className="text-xs text-muted-foreground">
            Your profile, kinks, ratings, and scenes are saved to your account and synced across
            every device you sign in on.
          </p>
          <div className="flex flex-col items-center gap-2 pt-2">
            <Button variant="outline" onClick={() => setProfile(emptyProfile)}>
              Reset profile
            </Button>
          </div>
        </Sticker>

        {user && (
          <Sticker className="space-y-3 text-center">
            <h2 className="font-display text-plum text-center font-normal text-3xl">Account</h2>
            <p className="text-xs text-muted-foreground">Signed in as {user.email}</p>
            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                onClick={handleLogout}
                className="text-sm text-link underline underline-offset-4 hover:opacity-80"
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
                onClick={() => {
                  setConfirmText("");
                  setShowDelete(true);
                }}
                className="text-sm font-semibold text-destructive underline underline-offset-4 hover:opacity-80"
              >
                Delete my account
              </button>
            </div>
          </Sticker>
        )}
      </div>

      {/* Cancel subscription walkthrough */}
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
                      <li>
                        Email <span className="font-semibold">support@departmentofconsent.com</span>{" "}
                        from the address you used to sign up.
                      </li>
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

      {/* Delete account confirmation */}
      <AlertDialog
        open={showDelete}
        onOpenChange={(o) => {
          setShowDelete(o);
          if (!o) setConfirmText("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  This permanently deletes your account, profile, and saved scenes. Active
                  subscriptions are not automatically refunded — cancel first if needed.
                </p>
                <p>
                  Type <span className="font-mono font-bold">DELETE</span> to confirm.
                </p>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/40 pb-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="text-sm whitespace-pre-wrap">
        {value || <span className="text-muted-foreground italic">not set</span>}
      </div>
    </div>
  );
}
