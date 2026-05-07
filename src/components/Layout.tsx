import { Link } from "@tanstack/react-router";
import { Home, ListChecks, Heart, User } from "lucide-react";

export function Layout({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  return (
    <div className="min-h-screen grain bg-background flex flex-col">
      <main className={fullBleed ? "flex-1 pb-28" : "flex-1 max-w-2xl w-full mx-auto px-5 pt-10 pb-32"}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/sessions", label: "Scenes", Icon: ListChecks },
    { to: "/kinks", label: "Kinks", Icon: Heart },
    { to: "/onboarding", label: "Profile", Icon: User },
  ] as const;
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 bg-white border-2 border-coral rounded-full shadow-lg max-w-md mx-auto">
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-coral text-[11px] rounded-full"
              activeProps={{ className: "flex flex-col items-center justify-center gap-0.5 py-2.5 text-coral text-[11px] font-semibold rounded-full" }}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
