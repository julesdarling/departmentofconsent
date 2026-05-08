import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Department of Consent" },
      { name: "description", content: "How Department of Consent collects, uses, and protects your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <Layout showFooter>
      <article className="prose prose-sm max-w-none space-y-4">
        <h1 className="font-display text-4xl text-plum">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <p>
          Department of Consent ("we", "us") helps people negotiate kink, limits,
          and aftercare. We take your privacy seriously and try to collect as
          little as possible.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">What we collect</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Account info:</strong> email address and authentication tokens used to sign you in.</li>
          <li><strong>Profile content:</strong> name/handle, pronouns, names you do and don't like, healthcare and emergency contact info, default safewords and aftercare needs.</li>
          <li><strong>Kink ratings, scenes, and partner replies:</strong> the limits, scenes, and shared sessions you create or receive.</li>
          <li><strong>Subscription status:</strong> whether you have an active paid plan (handled by our payment processor; we do not store your card).</li>
        </ul>

        <h2 className="font-display text-2xl text-plum pt-4">Where it lives</h2>
        <p>
          Your account, profile, kink ratings, scenes, and shared session data
          are stored in our secure cloud database so you can sign in from any
          device and share scenes with play partners. Some preferences (like
          dismissing the cookie banner) are kept on your device in local storage.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Sharing</h2>
        <p>
          When you generate a share link for a play partner, the contents of
          that scene (including the limits and details you've chosen to share)
          are visible to anyone who has the link. We don't sell your data and
          we don't share it with advertisers.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Your rights</h2>
        <p>
          You can edit your profile at any time, erase data stored on your
          device, cancel your subscription, or permanently delete your account
          from the Profile page. Account deletion removes your profile and
          associated records from our database.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Contact</h2>
        <p>
          Questions? Email <strong>support@departmentofconsent.com</strong>.
        </p>
      </article>
    </Layout>
  );
}
