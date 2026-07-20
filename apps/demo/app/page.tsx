"use client";

import { ToastProvider, toast } from "@th1n/toast";
import { useEffect, useState } from "react";

const actions = [
  {
    indicator: "bg-green-300 shadow-[0_0_14px_rgb(103_232_249/0.9)]",
    label: "Success",
    tone: "border-green-300/20 hover:border-green-200/45 hover:bg-green-300/[0.09]",
    run: () =>
      toast.success("Success", {
        description: "This is mocked success message.",
        grain: true,
        showCategory: false,
      }),
  },
  {
    indicator: "bg-sky-300 shadow-[0_0_14px_rgb(125_211_252/0.9)]",
    label: "Info",
    tone: "border-sky-300/20 hover:border-sky-200/45 hover:bg-sky-300/[0.09]",
    run: () =>
      toast.info("Info", {
        description: "This is mocked information message.",
        grain: true,
        showCategory: false,
      }),
  },
  {
    indicator: "bg-amber-300 shadow-[0_0_14px_rgb(252_211_77/0.9)]",
    label: "Warning",
    tone: "border-amber-300/20 hover:border-amber-200/45 hover:bg-amber-300/[0.09]",
    run: () =>
      toast.warning("Warning", {
        description: "This is mocked warning message.",
        grain: true,
        showCategory: false,
      }),
  },
  {
    indicator: "bg-rose-400 shadow-[0_0_14px_rgb(251_113_133/0.9)]",
    label: "Error",
    tone: "border-rose-400/20 hover:border-rose-300/45 hover:bg-rose-400/[0.09]",
    run: () =>
      toast.error("Error", {
        description: "This is mocked error message.",
        grain: true,
        showCategory: false,
      }),
  },
];

export default function Home() {
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("https://api.github.com/repos/th11n/toast")
      .then((response) => (response.ok ? response.json() : null))
      .then((repository) => {
        if (isMounted && typeof repository?.stargazers_count === "number") {
          setGithubStars(repository.stargazers_count);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ToastProvider>
      <main className="relative w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="absolute -bottom-72 -left-56 size-[42rem] rounded-full bg-cyan-300/35 blur-[150px]" />
          <div className="absolute -bottom-64 left-[18%] size-[34rem] rounded-full bg-sky-500/30 blur-[145px]" />
          <div className="absolute -bottom-56 left-[42%] size-[30rem] rounded-full bg-indigo-500/25 blur-[140px]" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-10 bg-[url('https://www.ui-layouts.com/noise.gif')] opacity-[0.03]"
        />
        <div className="relative z-20 mx-auto flex min-h-screen w-1/2 flex-col items-center justify-center gap-10 text-center">
          <div className="relative min-h-[34rem] rounded-xl bg-white/5 px-12 py-24 shadow-sm shadow-white/20">
            <div className="space-y-4">
              <p className="text-xs font-medium tracking-[0.2em] text-sky-200/65 uppercase">
                @th1n/toast
              </p>
              <h1 className="max-w-2xl text-5xl font-light tracking-[-0.055em] text-white sm:text-6xl">
                Modern toast system.
              </h1>
              <p className="max-w-lg text-lg leading-8 text-slate-300/80">
                Minimal feedback with clear status hierarchy and layered motion.
              </p>
            </div>

            <div className="relative z-20 mt-10 grid max-w-xl items-start justify-start gap-2 sm:grid-cols-2">
              {actions.map((action) => (
                <button
                  className={`flex items-start gap-3 rounded-lg border bg-black/20 px-4 py-3.5 text-left transition duration-200 ease-out hover:text-white focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:outline-none ${action.tone}`}
                  key={action.label}
                  onClick={action.run}
                  type="button"
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${action.indicator}`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-100">
                      Show {action.label}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <footer className="absolute right-12 bottom-8 left-12 flex items-center justify-between border-white/10 border-t pt-5 text-sm text-slate-400">
              <nav
                aria-label="Footer navigation"
                className="flex items-center gap-5"
              >
                <a className="transition hover:text-sky-200" href="/docs">
                  Documentation
                </a>
                <a
                  className="transition hover:text-sky-200"
                  href="https://github.com/th11n/toast"
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub
                </a>
              </nav>
              <a
                className="inline-flex items-center gap-2 text-xs transition hover:text-sky-200"
                href="https://github.com/th11n/toast/stargazers"
                rel="noreferrer"
                target="_blank"
              >
                <svg
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-sky-200"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="m12 2.5 2.94 5.96 6.58.96-4.76 4.64 1.12 6.56L12 17.53l-5.88 3.09 1.12-6.56-4.76-4.64 6.58-.96L12 2.5Z" />
                </svg>
                <span className="text-slate-200 tabular-nums">
                  {githubStars?.toLocaleString() ?? "—"}
                </span>
              </a>
            </footer>
          </div>
        </div>
      </main>
    </ToastProvider>
  );
}
