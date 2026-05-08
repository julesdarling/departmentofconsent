import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-plum text-white px-6 py-10 mt-0">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <p className="font-display text-2xl">Department of Consent</p>
        <p className="text-xs opacity-80 max-w-sm mx-auto">
          A soft place to negotiate the spicy stuff. Made with care for kinky humans everywhere.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs underline-offset-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/sessions" className="hover:underline">Scenes</Link>
          <Link to="/kinks" className="hover:underline">Kinks</Link>
          <Link to="/settings" className="hover:underline">Profile</Link>
        </nav>
        <p className="text-[10px] opacity-60 pt-2">
          © {new Date().getFullYear()} Dept of Consent. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
