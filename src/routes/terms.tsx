import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Department of Consent" },
      { name: "description", content: "The terms that govern your use of Department of Consent." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <Layout showFooter>
      <article className="prose prose-sm max-w-none space-y-4">
        <h1 className="font-display text-4xl text-plum">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <p>
          Welcome to Department of Consent. By using this app you agree to these
          terms. If you don't agree, please don't use the service.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Who can use it</h2>
        <p>
          You must be at least 18 years old (or the age of majority where you
          live) to use Department of Consent. The app is intended for adult
          consensual play between adults.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Your account</h2>
        <p>
          You're responsible for keeping your login secure and for the content
          you create, store, or share through your account. Don't impersonate
          others or share another person's information without their consent.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">No medical or legal advice</h2>
        <p>
          Department of Consent is a planning and communication tool. It is not
          a substitute for professional medical, mental health, or legal advice.
          You are responsible for your own safety and for negotiating consent
          with your play partners in person.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Acceptable use</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>No content involving minors. Ever.</li>
          <li>No non-consensual content, doxxing, or harassment.</li>
          <li>No use of the service to coerce, threaten, or harm anyone.</li>
        </ul>
        <p>We may suspend or terminate accounts that violate these rules.</p>

        <h2 className="font-display text-2xl text-plum pt-4">Subscriptions</h2>
        <p>
          Paid plans renew automatically until cancelled. You can cancel any
          time from the Profile page; you'll keep access through the end of
          the current billing period. Refunds are handled case-by-case.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Disclaimer</h2>
        <p>
          The service is provided "as is" without warranties of any kind. To the
          fullest extent allowed by law, Department of Consent is not liable
          for any indirect or consequential damages arising from your use of
          the service.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Changes</h2>
        <p>
          We may update these terms occasionally. Continued use after changes
          means you accept the updated terms.
        </p>

        <h2 className="font-display text-2xl text-plum pt-4">Contact</h2>
        <p>
          Questions? Email <strong>support@departmentofconsent.com</strong>.
        </p>
      </article>
    </Layout>
  );
}
