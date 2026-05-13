import { Link } from "@tanstack/react-router";
import flag from "@/assets/trans-flag.svg";

export function Footer() {
  return (
    <footer className="bg-plum text-white px-6 pt-14 pb-32">
      <div className="max-w-3xl mx-auto text-center space-y-5">
        <img src={flag} alt="Trans pride flag" className="h-8 w-auto mx-auto" />
        <p className="text-base sm:text-lg max-w-md mx-auto leading-snug">
          Department of Consent is proudly trans owned and operated.
        </p>
        <div className="pt-6 space-y-3">
          <p className="text-sm opacity-90">
            Questions? <a href="mailto:support@departmentofconsent.com" className="underline underline-offset-4 hover:opacity-80">support@departmentofconsent.com</a>
          </p>
          <p className="text-sm opacity-90">
            Copyright Department of Consent {new Date().getFullYear()}
          </p>
          <nav className="flex justify-center gap-8 text-sm font-semibold">
            <Link to="/privacy" className="hover:underline underline-offset-4">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline underline-offset-4">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
