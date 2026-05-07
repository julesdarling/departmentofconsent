import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, X, Home, ListChecks, Heart, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/useAuth";


export function Layout({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen grain bg-background flex flex-col">
      {isHome && (
        <header className="absolute top-0 right-0 z-40 p-4">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="w-11 h-11 rounded-full border-2 border-coral bg-blush grid place-items-center text-coral hover:bg-pinkbg transition"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>
      )}

      <main className={fullBleed ? "flex-1" : `flex-1 max-w-2xl w-full mx-auto px-5 pt-20 ${isHome ? "pb-10" : "pb-28"}`}>
        {children}
      </main>

      {isHome ? <Footer /> : <BottomNav />}

      {open && <MenuOverlay onClose={() => setOpen(false)} />}
    </div>
  );
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div
      className="fixed inset-0 z-50 bg-blush flex flex-col"
      onClick={onClose}
    >
      <div className="flex justify-end p-4">
        <button
          aria-label="Close menu"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="w-11 h-11 rounded-full border-2 border-coral bg-blush grid place-items-center text-coral"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 -mt-10">
        <MenuLink to="/sessions" onClose={onClose}>Saved scenes</MenuLink>
        <MenuLink to="/sessions/new" onClose={onClose}>New session</MenuLink>
        <MenuLink to="/kinks" onClose={onClose}>My kinks</MenuLink>
        <MenuLink to="/onboarding" onClose={onClose}>Profile</MenuLink>
        {user ? (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await signOut();
              onClose();
              navigate({ to: "/" });
            }}
            className="flex justify-center w-full"
          >
            <div className="cloud-btn cloud-btn-fluid" data-variant="outline"><span>Sign out</span></div>
          </button>
        ) : (
          <MenuLink to="/auth" onClose={onClose}>Sign in</MenuLink>
        )}
      </div>
    </div>
  );
}

function MenuLink({ to, onClose, children }: { to: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      className="flex justify-center w-full"
    >
      <div className="cloud-btn cloud-btn-fluid" data-variant="outline"><span>{children}</span></div>
    </Link>
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
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-blush border-t-2 border-coral">
      <ul className="max-w-2xl mx-auto grid grid-cols-4">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex flex-col items-center justify-center gap-1 py-3 text-coral text-xs"
              activeProps={{ className: "flex flex-col items-center justify-center gap-1 py-3 text-coral text-xs font-semibold" }}
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

function Footer() {
  return (
    <footer className="bg-plum text-cream text-center py-8 px-4 text-sm">
      <div className="flex justify-center mb-3">
        <div className="flex h-6 w-10 overflow-hidden rounded-sm border border-cream/20">
          <div className="flex flex-col flex-1">
            <div className="flex-1" style={{ background: "#5BCEFA" }} />
            <div className="flex-1" style={{ background: "#F5A9B8" }} />
            <div className="flex-1 bg-white" />
            <div className="flex-1" style={{ background: "#F5A9B8" }} />
            <div className="flex-1" style={{ background: "#5BCEFA" }} />
          </div>
        </div>
      </div>
      <p className="opacity-90">Department of Consent is proudly trans owned and operated.</p>
      <p className="opacity-60 mt-4 text-xs">Copyright Department of Consent 2026</p>
      <div className="mt-2 flex justify-center gap-4 text-xs opacity-90">
        <Link to="/">Privacy Policy</Link>
        <Link to="/">Terms of Service</Link>
      </div>
    </footer>
  );
}
