import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="content-shell mt-auto flex flex-col gap-4 border-t border-white/[0.07] py-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <img src="/ponflix-logo.png" alt="Ponflix" className="h-5 w-auto opacity-75" />
        <span>Stories worth staying in for.</span>
      </div>
      <nav aria-label="Footer navigation" className="flex items-center gap-4">
        <Link to="/home" className="transition-colors hover:text-white/80">
          Browse comics
        </Link>
        <Link to="/anime" className="transition-colors hover:text-white/80">
          Anime
        </Link>
      </nav>
    </footer>
  );
}
