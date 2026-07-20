"use client";

import { Toast } from "@th1n/toast";
import { toJpeg } from "html-to-image";
import { useRef, useState } from "react";

const previewToasts = [
  {
    description: "Your changes are live.",
    title: "Changes saved",
    variant: "success" as const,
  },
  {
    description: "A newer release is ready.",
    title: "New version available",
    variant: "info" as const,
  },
  {
    description: "Save your work to continue.",
    title: "Session expires soon",
    variant: "warning" as const,
  },
  {
    description: "Check your connection and try again.",
    title: "Could not sync changes",
    variant: "error" as const,
  },
];

export default function DemoPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const exportCard = async () => {
    if (!cardRef.current || isExporting) {
      return;
    }

    setIsExporting(true);

    try {
      const dataUrl = await toJpeg(cardRef.current, {
        backgroundColor: "#050708",
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.95,
      });
      const link = document.createElement("a");

      link.download = "toast-preview.jpg";
      link.href = dataUrl;
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#050708] p-5">
      <div
        className="relative isolate aspect-video min-h-[25rem] w-[min(56rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgb(0_0_0/0.35)]"
        ref={cardRef}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -bottom-64 -left-52 size-[32rem] rounded-full bg-cyan-300/35 blur-[120px]" />
          <div className="absolute -bottom-56 left-[20%] size-[28rem] rounded-full bg-sky-500/30 blur-[120px]" />
          <div className="absolute -bottom-64 left-[48%] size-[24rem] rounded-full bg-indigo-500/25 blur-[110px]" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[url('https://www.ui-layouts.com/noise.gif')] opacity-[0.035]"
        />
        <section
          aria-label="Toast preview"
          className="absolute top-[calc(50%_-_0.625rem)] left-1/2 z-10 h-[23rem] w-[min(24rem,calc(100%_-_2.5rem))] -translate-x-1/2 -translate-y-1/2"
        >
          {previewToasts.map((toast, index) => (
            <div
              className="absolute right-0 bottom-0 left-0"
              key={toast.variant}
              style={{
                filter: `blur(${index * 0.18}px)`,
                opacity: 1 - index * 0.05,
                scale: 1 - index * 0.018,
                transform: `translateY(${-index * 84}px)`,
                transformOrigin: "center bottom",
                zIndex: previewToasts.length - index,
              }}
            >
              <Toast duration={0} grain {...toast} />
            </div>
          ))}
        </section>
      </div>
      <button
        className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-200 transition hover:border-sky-200/40 hover:bg-sky-200/10 hover:text-sky-100 disabled:cursor-wait disabled:opacity-60"
        disabled={isExporting}
        onClick={exportCard}
        type="button"
      >
        {isExporting ? "Exporting…" : "Export JPG"}
      </button>
    </main>
  );
}
