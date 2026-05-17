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
const REDIRECT_AFTER_AUTH = "/onboarding";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Department of Consent" },
      { name: "description", content: "Sign in or create an account to save your kink profile, negotiate scenes, and share private scene links with play partners." },
      { property: "og:title", content: "Sign in — Department of Consent" },
      { property: "og:description", content: "Sign in or create an account to save your kink profile and share scenes with play partners." },
    ],
  }),
  component: AuthPage,
});


const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

const signinSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(1, "Enter your password").max(72),
});

const signupSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/\d/, "Password must include a number"),
});

function calculateAge(dobIso: string): number {
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: REDIRECT_AFTER_AUTH });
    });
  }, [navigate]);

  const sendReset = async () => {
    const emailParsed = z.string().trim().email().max(255).safeParse(email);
    if (!emailParsed.success) {
      toast.error("Enter a valid email");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailParsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent. Check your inbox.");
      setMode("signin");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const parsed = (mode === "signup" ? signupSchema : signinSchema).safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (mode === "signup") {
      if (!dob) {
        toast.error("Enter your date of birth");
        return;
      }
      const age = calculateAge(dob);
      if (age < 0) {
        toast.error("Enter a valid date of birth");
        return;
      }
      if (age < 18) {
        toast.error("You must be at least 18 to sign up");
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}${REDIRECT_AFTER_AUTH}`,
            data: { dob, age_confirmed_18_plus: true },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        navigate({ to: REDIRECT_AFTER_AUTH });
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
      redirect_uri: window.location.origin + REDIRECT_AFTER_AUTH,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
      return;
    }
    if (!result.redirected) navigate({ to: REDIRECT_AFTER_AUTH });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center pt-2">
          <h1 className="font-display text-5xl text-foreground tracking-tight">
            {mode === "signin" ? "Start playing safely" : mode === "signup" ? "Create your account" : "Reset password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "signin"
              ? "Sign in to access your scenes."
              : mode === "signup"
                ? "Sign up to save your profile and scenes."
                : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {mode !== "forgot" && <PricingCard />}

        <Sticker className="space-y-4">
          <div className="space-y-1.5">
            <Label className="doc-label">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <Label className="doc-label">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Create a strong password" : "Your password"}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
              {mode === "signup" && (
                <ul className="text-xs space-y-0.5 pt-1">
                  {PASSWORD_RULES.map((r) => {
                    const ok = r.test(password);
                    return (
                      <li
                        key={r.label}
                        className={ok ? "text-yes" : "text-muted-foreground"}
                      >
                        <span className="inline-block w-4">{ok ? "✓" : "○"}</span>
                        {r.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label className="doc-label">Date of birth</Label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                autoComplete="bday"
              />
              <p className="text-xs text-muted-foreground">You must be at least 18 to sign up.</p>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 pt-2">
            {mode === "forgot" ? (
              <CloudButton onClick={sendReset} className="cloud-btn-fluid">
                {busy ? "..." : "Send reset link"}
              </CloudButton>
            ) : (
              <>
                <CloudButton onClick={submit} className="cloud-btn-fluid">
                  {busy ? "..." : mode === "signin" ? "Sign in" : "Create account & subscribe"}
                </CloudButton>
                <CloudButton onClick={google} variant="outline" className="cloud-btn-fluid">
                  Continue with Google
                </CloudButton>
              </>
            )}
          </div>

          <div className="text-center text-sm pt-2 space-y-1">
            {mode === "signin" && (
              <>
                <div>
                  New here?{" "}
                  <button className="underline text-link" onClick={() => setMode("signup")}>
                    Create an account
                  </button>
                </div>
                <div>
                  <button className="underline text-link text-xs" onClick={() => setMode("forgot")}>
                    Forgot password?
                  </button>
                </div>
              </>
            )}
            {mode === "signup" && (
              <>
                Have an account?{" "}
                <button className="underline text-link" onClick={() => setMode("signin")}>
                  Sign in
                </button>
              </>
            )}
            {mode === "forgot" && (
              <button className="underline text-link" onClick={() => setMode("signin")}>
                ← Back to sign in
              </button>
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
