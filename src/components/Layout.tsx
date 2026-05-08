import { Link, useLocation } from "@tanstack/react-router";
import { ListChecks, Heart, User } from "lucide-react";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import wordmark from "@/assets/logo.svg";

export function Layout({ children, fullBleed = false, showFooter = false }: { children: React.ReactNode; fullBleed?: boolean; showFooter?: boolean }) {
  const { pathname } = useLocation();
  const showHeader = pathname !== "/";
  return (
    <div className="min-h-screen grain bg-background flex flex-col">
      {showHeader && (
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
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/sessions", label: "Scenes", Icon: ListChecks },
    { to: "/kinks", label: "Kinks", Icon: Heart },
    { to: "/settings", label: "Profile", Icon: User },
  ] as const;
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 bg-white rounded-full shadow-lg max-w-md mx-auto">
      <ul className="grid grid-cols-3">
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
