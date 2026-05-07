import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Sticker } from "@/components/Sticker";
import { CloudButton } from "@/components/CloudButton";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Welcome ♡" }] }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  return (
    <Layout>
      <div className="space-y-5">
        <Sticker variant="coral" className="text-center space-y-3">
          <div className="text-5xl">💖</div>
          <h1 className="font-display text-3xl text-plum">You're in.</h1>
          <p className="text-sm text-muted-foreground">
            {session_id ? "Subscription confirmed." : "Welcome aboard."}
          </p>
          <div className="pt-2 flex justify-center">
            <CloudButton to="/sessions">Go to your scenes</CloudButton>
          </div>
        </Sticker>
      </div>
    </Layout>
  );
}
