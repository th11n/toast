"use client";

import {
  CheckCircleIcon,
  type Icon,
  InfoIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import {
  animate,
  motion,
  useMotionValue,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";
import type {
  ToastProps,
  ToastVariant,
} from "./types";

const variantStyles: Record<
  ToastVariant,
  {
    gradient: string;
    icon: Icon;
    iconAccent: string;
    label: string;
  }
> = {
  success: {
    gradient:
      "radial-gradient(115% 135% at 100% 100%, rgb(74 222 128 / 0.08) 0%, transparent 62%)",
    icon: CheckCircleIcon,
    iconAccent:
      "bg-green-300/15 text-green-200 ring-green-200/25",
    label: "Success",
  },
  info: {
    gradient:
      "radial-gradient(115% 135% at 100% 100%, rgb(56 189 248 / 0.08) 0%, transparent 62%)",
    icon: InfoIcon,
    iconAccent:
      "bg-sky-300/15 text-sky-200 ring-sky-200/25",
    label: "Information",
  },
  warning: {
    gradient:
      "radial-gradient(115% 135% at 100% 100%, rgb(251 191 36 / 0.07) 0%, transparent 62%)",
    icon: WarningCircleIcon,
    iconAccent:
      "bg-amber-300/15 text-amber-100 ring-amber-200/25",
    label: "Warning",
  },
  error: {
    gradient:
      "radial-gradient(115% 135% at 100% 100%, rgb(251 113 133 / 0.07) 0%, transparent 62%)",
    icon: XCircleIcon,
    iconAccent:
      "bg-rose-400/15 text-rose-100 ring-rose-200/25",
    label: "Error",
  },
};

const DISMISS_OFFSET = 96;
const DISMISS_VELOCITY = 600;
const MAX_DRAG_DISTANCE = 180;
const EXIT_PADDING = 80;

const RETURN_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.7,
};

const DISMISS_EASE: [
  number,
  number,
  number,
  number,
] = [0.4, 0, 1, 1];

export function Toast({
  title,
  className,
  description,
  duration = 5_000,
  grain = false,
  icon,
  showCategory = true,
  showDescription = true,
  style: customStyle,
  dismissDirection = 1,
  variant = "info",
  onDismiss,
}: ToastProps) {
  const toastRef =
    useRef<HTMLElement>(null);

  const x = useMotionValue(0);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isDismissing, setIsDismissing] =
    useState(false);

  const variantStyle =
    variantStyles[variant];

  const DefaultIcon = variantStyle.icon;

  const renderedIcon =
    icon ?? (
      <DefaultIcon
        size={18}
        weight="duotone"
      />
    );

  const dragConstraints =
    dismissDirection === 1
      ? {
        left: 0,
        right: MAX_DRAG_DISTANCE,
      }
      : {
        left: -MAX_DRAG_DISTANCE,
        right: 0,
      };

  useEffect(() => {
    if (
      !onDismiss ||
      duration <= 0 ||
      isDragging ||
      isDismissing
    ) {
      return;
    }

    const timeout = window.setTimeout(
      onDismiss,
      duration,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    duration,
    isDismissing,
    isDragging,
    onDismiss,
  ]);

  return (
    <motion.section
      ref={toastRef}
      className={twMerge(
        "relative w-full cursor-grab overflow-hidden touch-pan-y rounded-xl bg-[#121212] px-4 py-3.5 text-slate-100 shadow-[0_18px_50px_rgb(0_0_0/0.28)] backdrop-blur-xl active:cursor-grabbing",
        className,
      )}
      drag={
        isDismissing ? false : "x"
      }
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => {
        setIsDragging(true);
      }}
      onDragEnd={async (_, info) => {
        const directionalOffset =
          info.offset.x * dismissDirection;

        const directionalVelocity =
          info.velocity.x *
          dismissDirection;

        const shouldDismiss =
          directionalOffset >=
          DISMISS_OFFSET ||
          directionalVelocity >=
          DISMISS_VELOCITY;

        if (!shouldDismiss) {
          await animate(
            x,
            0,
            RETURN_SPRING,
          );

          setIsDragging(false);
          return;
        }

        setIsDragging(false);
        setIsDismissing(true);

        const toastWidth =
          toastRef.current
            ?.getBoundingClientRect()
            .width ?? 384;

        const exitX =
          dismissDirection *
          (toastWidth + EXIT_PADDING);

        await animate(x, exitX, {
          duration: 0.24,
          ease: DISMISS_EASE,
        });

        onDismiss?.();
      }}
      role={
        variant === "error"
          ? "alert"
          : "status"
      }
      style={{
        backgroundImage:
          variantStyle.gradient,
        ...customStyle,
        x,
      }}
      tabIndex={0}
      whileDrag={{
        scale: 0.985,
      }}
    >
      {grain ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage:
              "url('https://www.ui-layouts.com/noise.gif')",
          }}
        />
      ) : null}

      <div className="relative z-10 flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 ${variantStyle.iconAccent}`}
        >
          {renderedIcon}
        </span>

        <div className="min-w-0 flex-1">
          {showCategory ? (
            <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
              {variantStyle.label}
            </p>
          ) : null}

          <p
            className={twMerge(
              "font-medium tracking-[-0.01em] text-slate-100",
              showCategory && "mt-0.5",
            )}
          >
            {title}
          </p>

          {description &&
            showDescription ? (
            <p className="mt-1 text-sm leading-5 text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}