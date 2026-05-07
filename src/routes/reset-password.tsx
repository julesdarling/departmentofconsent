import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { CloudButton } from "@/components/CloudButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Department of Consent" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = z.string().min(8, "At least 8 characters").max(72).safeParse(password);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parsed.data });
      if (error) throw error;
      toast.success("Password updated.");
      navigate({ to: "/subscribe" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center pt-2">
          <h1 className="font-display text-5xl text-foreground tracking-tight">Set a new password</h1>
        </div>
        <Sticker className="space-y-4">
          <div className="space-y-1.5">
            <Label className="doc-label">New password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" />
          </div>
          <div className="flex justify-center pt-2">
            <CloudButton onClick={submit} className="cloud-btn-fluid">
              {busy ? "..." : "Update password"}
            </CloudButton>
          </div>
          <div className="text-center text-xs text-muted-foreground">
            <Link to="/auth">← Back to sign in</Link>
          </div>
        </Sticker>
      </div>
    </Layout>
  );
}
