import { Sparkles, UsersRound } from "lucide-react";

export default function Nav() {
  return (
    <header className="mb-4 bg-slate-950 text-xl text-white font-medium sticky top-0 sm:relative">
      <nav className="px-4 sm:px-6 lg:px-20 py-6">
        <ul className="flex justify-between items-center gap-4">
          <li>
            <a href="/" className="flex gap-1 font-semibold text-nowrap">
              The Cloud Project{" "}
              <Sparkles strokeWidth={2.5} className="size-5" />
            </a>
          </li>
          <li>
            <a
              href="/infos"
              className="flex gap-1 font-semibold text-nowrap items-center"
            >
              <span className="hidden sm:block">Notre équipe</span>
              <UsersRound className="size-5" />
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
