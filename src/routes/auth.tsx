import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { CloudButton } from "@/components/CloudButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { z } from "zod";
import { PricingCard } from "@/components/PricingCard";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Department of Consent" }] }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/onboarding" });
    });
  }, [navigate]);

  const submit = async () => {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        navigate({ to: "/onboarding" });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/onboarding",
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
      return;
    }
    if (!result.redirected) navigate({ to: "/onboarding" });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center pt-2">
          <h1 className="font-display text-5xl text-foreground tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "signin" ? "Sign in to access your scenes." : "Sign up to save your profile and scenes."}
          </p>
        </div>

        <PricingCard />

        <Sticker className="space-y-4">
          <div className="space-y-1.5">
            <Label className="doc-label">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label className="doc-label">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={mode === "signin" ? "current-password" : "new-password"} />
          </div>

          <div className="flex flex-col items-center gap-3 pt-2">
            <CloudButton onClick={submit} className="cloud-btn-fluid">
              {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </CloudButton>
            <CloudButton onClick={google} variant="outline" className="cloud-btn-fluid">
              Continue with Google
            </CloudButton>
          </div>

          <div className="text-center text-sm pt-2">
            {mode === "signin" ? (
              <>
                New here?{" "}
                <button className="underline text-coral" onClick={() => setMode("signup")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Have an account?{" "}
                <button className="underline text-coral" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </>
            )}
          </div>
          <div className="text-center text-xs text-muted-foreground">
            <Link to="/">← Back home</Link>
          </div>
        </Sticker>
      </div>
    </Layout>
  );
}
