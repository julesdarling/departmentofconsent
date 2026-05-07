import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { CloudButton } from "@/components/CloudButton";

export function Layout({ children, fullBleed = false }: { children: React.ReactNode; fullBleed?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen grain bg-background flex flex-col">
      <header className="absolute top-0 right-0 z-40 p-4">
        <button
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="w-11 h-11 rounded-full border-2 border-coral bg-blush grid place-items-center text-coral hover:bg-pinkbg transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <main className={fullBleed ? "flex-1" : "flex-1 max-w-2xl w-full mx-auto px-5 pt-20 pb-10"}>
        {children}
      </main>

      <Footer />

      {open && <MenuOverlay onClose={() => setOpen(false)} />}
    </div>
  );
}

function MenuOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-blush flex flex-col">
      <div className="flex justify-end p-4">
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="w-11 h-11 rounded-full border-2 border-coral bg-blush grid place-items-center text-coral"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 -mt-10">
        <CloudButton variant="outline" to="/sessions" className="w-full max-w-sm">
          <span onClick={onClose}>Saved scenes</span>
        </CloudButton>
        <CloudButton variant="outline" to="/sessions/new" className="w-full max-w-sm">
          <span onClick={onClose}>New session</span>
        </CloudButton>
        <CloudButton variant="outline" to="/kinks" className="w-full max-w-sm">
          <span onClick={onClose}>My kinks</span>
        </CloudButton>
        <CloudButton variant="outline" to="/onboarding" className="w-full max-w-sm">
          <span onClick={onClose}>Profile</span>
        </CloudButton>
      </div>
    </div>
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
