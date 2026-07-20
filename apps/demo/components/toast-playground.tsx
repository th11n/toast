"use client";

import {
  type ToastPosition,
  ToastProvider,
  type ToastVariant,
  toast,
} from "@dominikkrakowiak/toast";
import { useMemo, useState } from "react";

const variants: ToastVariant[] = ["success", "info", "warning", "error"];
const positions: ToastPosition[] = [
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
];

const variantStyles: Record<ToastVariant, { indicator: string; tone: string }> =
{
  success: {
    indicator: "bg-green-300 shadow-[0_0_14px_rgb(103_232_249/0.9)]",
    tone: "border-green-300/20 hover:border-green-200/45 hover:bg-green-300/[0.09] data-[active=true]:border-green-200/45 data-[active=true]:bg-green-300/[0.09]",
  },
  info: {
    indicator: "bg-sky-300 shadow-[0_0_14px_rgb(125_211_252/0.9)]",
    tone: "border-sky-300/20 hover:border-sky-200/45 hover:bg-sky-300/[0.09] data-[active=true]:border-sky-200/45 data-[active=true]:bg-sky-300/[0.09]",
  },
  warning: {
    indicator: "bg-amber-300 shadow-[0_0_14px_rgb(252_211_77/0.9)]",
    tone: "border-amber-300/20 hover:border-amber-200/45 hover:bg-amber-300/[0.09] data-[active=true]:border-amber-200/45 data-[active=true]:bg-amber-300/[0.09]",
  },
  error: {
    indicator: "bg-rose-400 shadow-[0_0_14px_rgb(251_113_133/0.9)]",
    tone: "border-rose-400/20 hover:border-rose-300/45 hover:bg-rose-400/[0.09] data-[active=true]:border-rose-300/45 data-[active=true]:bg-rose-400/[0.09]",
  },
};

const controlClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-sky-300/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-sky-300/10";

export function ToastPlayground() {
  const [variant, setVariant] = useState<ToastVariant>("success");
  const [position, setPosition] = useState<ToastPosition>("top-right");
  const [title, setTitle] = useState("Changes saved");
  const [description, setDescription] = useState(
    "Your workspace is up to date.",
  );
  const [showDescription, setShowDescription] = useState(true);
  const [showCategory, setShowCategory] = useState(false);
  const [grain, setGrain] = useState(true);

  const code = useMemo(() => {
    const options = [
      showDescription && description ? `description: "${description}"` : null,
      !showDescription ? "showDescription: false" : null,
      showCategory ? "showCategory: true" : null,
      grain ? "grain: true" : null,
    ].filter((option): option is string => option !== null);

    const toastTitle = title || "Untitled notification";

    if (options.length === 0) {
      return `toast.${variant}("${toastTitle}");`;
    }

    return `toast.${variant}("${toastTitle}", {\n  ${options.join(",\n  ")},\n});`;
  }, [description, grain, showCategory, showDescription, title, variant]);

  function showToast() {
    toast[variant](title || "Untitled notification", {
      description,
      grain,
      showCategory,
      showDescription,
    });
  }

  return (
    <ToastProvider position={position}>
      <section className="not-prose relative overflow-hidden rounded-xl bg-[#0b1018c7] shadow-sm shadow-white/10 backdrop-blur-sm">
        <div className="relative z-10 grid divide-y divide-white/8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:divide-x md:divide-y-0">
          <div className="min-w-0 space-y-5 p-5">
            <Field label="Variant">
              <div className="grid grid-cols-2 gap-2">
                {variants.map((item) => (
                  <button
                    className={`flex items-center gap-3 rounded-lg border bg-black/20 px-3 py-3 text-left text-xs font-medium text-slate-400 transition duration-200 ease-out hover:text-white focus-visible:ring-2 focus-visible:ring-sky-200/70 focus-visible:outline-none data-[active=true]:text-white ${variantStyles[item].tone}`}
                    data-active={variant === item}
                    key={item}
                    onClick={() => setVariant(item)}
                    type="button"
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${variantStyles[item].indicator}`}
                    />
                    <span className="capitalize">{item}</span>
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title">
                <input
                  className={controlClass}
                  onChange={(event) => setTitle(event.target.value)}
                  value={title}
                />
              </Field>
              <Field label="Position">
                <select
                  className={controlClass}
                  onChange={(event) =>
                    setPosition(event.target.value as ToastPosition)
                  }
                  value={position}
                >
                  {positions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Description">
              <input
                className={controlClass}
                disabled={!showDescription}
                onChange={(event) => setDescription(event.target.value)}
                value={description}
              />
            </Field>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Toggle
                checked={showDescription}
                label="Description"
                onChange={setShowDescription}
              />
              <Toggle
                checked={showCategory}
                label="Category"
                onChange={setShowCategory}
              />
              <Toggle checked={grain} label="Grain" onChange={setGrain} />
            </div>

            <button
              className="w-full rounded-lg bg-sky-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 focus-visible:ring-2 focus-visible:ring-sky-100/70 focus-visible:outline-none"
              onClick={showToast}
              type="button"
            >
              Show {variant} toast
            </button>
          </div>

          <div className="min-w-0 p-5">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
              Generated call
            </p>
            <pre className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-white/7 bg-black/25 p-4 text-xs leading-6 text-sky-100">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      </section>
    </ToastProvider>
  );
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      aria-pressed={checked}
      className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-xs text-slate-400 transition hover:border-white/15 hover:text-slate-200"
      onClick={() => onChange(!checked)}
      type="button"
    >
      {label}
      <span
        className={`size-1.5 rounded-full transition ${checked ? "bg-sky-300 shadow-[0_0_8px_rgb(125_211_252/0.9)]" : "bg-slate-700"}`}
      />
    </button>
  );
}
