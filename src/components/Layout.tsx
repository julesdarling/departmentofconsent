import { Link, useLocation } from "@tanstack/react-router";
import { ListChecks, Plus, User } from "lucide-react";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import wordmark from "@/assets/logo.svg";

export function Layout({ children, fullBleed = false, showFooter = false }: { children: React.ReactNode; fullBleed?: boolean; showFooter?: boolean }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  return (
    <div className="min-h-screen grain bg-background flex flex-col overflow-x-hidden">
      {!isHome && (
        <header className="w-full flex justify-center pt-6 pb-2">
          <Link to="/" aria-label="Dept of Consent — Home">
            <img src={wordmark} alt="Dept of Consent" className="h-16 w-auto" />
          </Link>
        </header>
      )}
      <main className={fullBleed ? "flex-1 pb-28" : "flex-1 max-w-2xl w-full mx-auto px-5 pt-4 pb-32"}>
        {children}
      </main>
      {showFooter && <Footer />}
      <CookieBanner />
      {!isHome && <BottomNav />}
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/sessions", label: "Scenes", Icon: ListChecks, exact: true },
    { to: "/sessions/new", label: "New scene", Icon: Plus, exact: false },
    { to: "/settings", label: "Profile", Icon: User, exact: false },
  ] as const;
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 bg-white rounded-full shadow-lg max-w-md mx-auto">
      <ul className="grid grid-cols-3">
        {items.map(({ to, label, Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-plum/60 text-[11px] rounded-full"
              activeProps={{ className: "flex flex-col items-center justify-center gap-0.5 py-2.5 text-plum text-[11px] font-bold rounded-full bg-gradient-to-b from-blush/60 to-transparent" }}
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
