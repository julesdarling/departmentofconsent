import { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("doc-cookie-ack")) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  if (!show) return null;

  const accept = () => {
    try { localStorage.setItem("doc-cookie-ack", "1"); } catch { /* ignore */ }
    setShow(false);
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto bg-white shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 border border-border">
      <p className="text-xs text-foreground/80 flex-1">
        We use cookies and local storage to keep you signed in and remember your preferences.
      </p>
      <button
        onClick={accept}
        className="text-xs font-semibold text-link underline underline-offset-4 shrink-0"
      >
        Got it
      </button>
    </div>
  );
}
