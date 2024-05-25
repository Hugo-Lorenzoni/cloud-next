import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-4 bg-slate-950 text-white sticky top-0 sm:relative">
      <div className="px-4 sm:px-6 lg:px-20 py-6">
        <ul className="flex justify-between flex-wrap">
          <li>
            <a href="/" className="flex text-xl gap-1 font-semibold">
              - The Cloud Project{" "}
              <Sparkles strokeWidth={2.5} className="size-5" />
            </a>
          </li>
          <li>
            Projet dans le cadre du cours de Cloud & Edge Computing 2023-2024,
            dirigé par Sidi Mahmoudi
          </li>
        </ul>
      </div>
    </footer>
  );
}
