import { ArrowRight, Clapperboard, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function UnderConstruction() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#08090b] px-4 pb-10 pt-24 text-center text-white">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_15%,rgba(229,9,20,0.18),transparent_42%),linear-gradient(145deg,#111216,#08090b_58%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-black/60 to-transparent" />

      <section className="max-w-xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-2xl shadow-black/30">
          <Clapperboard className="h-7 w-7 text-[#ff5661]" />
        </div>
        <p className="mt-7 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff6670]">
          <Sparkles className="h-3.5 w-3.5" /> Coming soon to Ponflix
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
          A new world is in the works.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/55 sm:text-base">
          We’re getting the anime collection ready. In the meantime, there are plenty of comics waiting for you.
        </p>
        <Link
          to="/comics"
          className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-black transition hover:bg-white/85"
        >
          Explore comics <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
