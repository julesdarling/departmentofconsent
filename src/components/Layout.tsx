import { Link } from "@tanstack/react-router";
import { Heart, Home, BookHeart, ListChecks, Settings } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grain pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <span className="font-display text-lg font-semibold text-plum">
              Department of Consent
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <div className="sticker px-2 py-2 flex items-center gap-1 bg-card">
          <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" exact />
          <NavItem to="/kinks" icon={<BookHeart className="h-5 w-5" />} label="Kinks" />
          <NavItem to="/sessions" icon={<ListChecks className="h-5 w-5" />} label="Sessions" />
          <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  exact,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground transition-colors data-[status=active]:text-primary data-[status=active]:bg-blush"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
