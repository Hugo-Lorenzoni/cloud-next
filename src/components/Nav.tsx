import { Sparkles } from "lucide-react";

export default function Nav() {
  return (
    <header className="mb-12 bg-slate-950 text-xl text-white font-medium sticky top-0 sm:relative">
      <nav className="px-4 sm:px-6 lg:px-20 py-6">
        <ul className="flex justify-between ">
          <li>
            <a href="/" className="flex gap-1 font-semibold">
              The Cloud Project{" "}
              <Sparkles strokeWidth={2.5} className="size-5" />
            </a>
          </li>
          <li>
            <a href="/info">Infos sur l'équipe</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
