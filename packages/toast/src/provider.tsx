"use client";

import { motion } from "framer-motion";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { Toast } from "./toast";
import { toastIconSets } from "./icon-sets";
import { registerToastDispatcher } from "./toast-api";
import type {
  ToastIcons,
  ToastIconStyle,
  ToastInput,
  ToastOptions,
  ToastPosition,
  ToastRecord,
  ToastVariant,
} from "./types";

const positions: Record<ToastPosition, string> = {
  "top-left": "top-5 left-5",
  "top-right": "top-5 right-5",
  "bottom-left": "bottom-5 left-5",
  "bottom-right": "bottom-5 right-5",
};

export const MAX_TOASTS = 3;
const STACK_PEEK = 38;
const EXPANDED_GAP = 8;
const DEFAULT_TOAST_HEIGHT = 88;

const ENTER_DISTANCE = 180;
const EXIT_DISTANCE = 200;

const SMOOTH_EASE: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

const EXIT_EASE: [number, number, number, number] = [
  0.4, 0, 1, 1,
];

export type ToastProviderProps = {
  children: ReactNode;
  /** Defaults applied to every toast; individual calls can override them. */
  defaultOptions?: ToastOptions;
  /** Ready-made icon family used unless an icon is explicitly overridden. */
  iconStyle?: ToastIconStyle;
  icons?: ToastIcons;
  /** Maximum number of cards visible in a stack at once. */
  maxToasts?: number;
  position?: ToastPosition;
};

export type ToastStackState = {
  toasts: ToastRecord[];
  exitingId: string | null;

  queuedToasts: ToastRecord[];

  queuedDismissals: string[];
};

export type ToastStackAction =
  | {
    type: "ADD";
    toast: ToastRecord;
  }
  | {
    type: "DISMISS";
    id: string;
  }
  | {
    type: "EXIT_FINISHED";
    id: string;
  };

export const initialToastStackState: ToastStackState = {
  toasts: [],
  exitingId: null,
  queuedToasts: [],
  queuedDismissals: [],
};

export function toastStackReducer(
  state: ToastStackState,
  action: ToastStackAction,
  maxToasts = MAX_TOASTS,
): ToastStackState {
  switch (action.type) {
    case "ADD": {
      if (state.exitingId) {
        return {
          ...state,
          queuedToasts: [
            ...state.queuedToasts,
            action.toast,
          ],
        };
      }

      if (state.toasts.length < maxToasts) {
        return {
          ...state,
          toasts: [action.toast, ...state.toasts],
        };
      }

      const oldestToast =
        state.toasts[state.toasts.length - 1];

      return {
        ...state,
        toasts: [action.toast, ...state.toasts],
        exitingId: oldestToast.id,
      };
    }

    case "DISMISS": {
      const exists = state.toasts.some(
        (toast) => toast.id === action.id,
      );

      if (!exists || state.exitingId === action.id) {
        return state;
      }

      if (state.exitingId) {
        if (state.queuedDismissals.includes(action.id)) {
          return state;
        }

        return {
          ...state,
          queuedDismissals: [
            ...state.queuedDismissals,
            action.id,
          ],
        };
      }

      return {
        ...state,
        exitingId: action.id,
      };
    }

    case "EXIT_FINISHED": {
      if (state.exitingId !== action.id) {
        return state;
      }

      let nextToasts = state.toasts.filter(
        (toast) => toast.id !== action.id,
      );

      let nextQueuedToasts = state.queuedToasts;

      const validQueuedDismissals =
        state.queuedDismissals.filter((id) =>
          nextToasts.some((toast) => toast.id === id),
        );

      const nextDismissal = validQueuedDismissals[0];

      if (nextDismissal) {
        return {
          toasts: nextToasts,
          exitingId: nextDismissal,
          queuedToasts: nextQueuedToasts,
          queuedDismissals:
            validQueuedDismissals.slice(1),
        };
      }

      while (
        nextToasts.length < maxToasts &&
        nextQueuedToasts.length > 0
      ) {
        const nextToast = nextQueuedToasts[0];

        nextToasts = [nextToast, ...nextToasts];
        nextQueuedToasts = nextQueuedToasts.slice(1);
      }

      if (
        nextToasts.length === maxToasts &&
        nextQueuedToasts.length > 0
      ) {
        const nextToast = nextQueuedToasts[0];
        const oldestToast =
          nextToasts[nextToasts.length - 1];

        return {
          toasts: [nextToast, ...nextToasts],
          exitingId: oldestToast.id,
          queuedToasts: nextQueuedToasts.slice(1),
          queuedDismissals: [],
        };
      }

      return {
        toasts: nextToasts,
        exitingId: null,
        queuedToasts: nextQueuedToasts,
        queuedDismissals: [],
      };
    }

    default:
      return state;
  }
}

type ToastStackItemProps = {
  toast: ToastRecord;
  iconStyle: ToastIconStyle;
  icons?: ToastIcons;
  targetY: number;
  visualIndex: number;
  isExpanded: boolean;
  isExiting: boolean;
  isTop: boolean;
  dismissDirection: -1 | 1;
  onDismiss: (id: string) => void;
  onExpand: () => void;
  onExitFinished: (id: string) => void;
  onHeightChange: (id: string, height: number) => void;
  maxToasts: number;
};

function ToastStackItem({
  toast,
  iconStyle,
  icons,
  targetY,
  visualIndex,
  isExpanded,
  isExiting,
  isTop,
  dismissDirection,
  onDismiss,
  onExpand,
  onExitFinished,
  onHeightChange,
  maxToasts,
}: ToastStackItemProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const frozenYRef = useRef(targetY);
  const frozenZIndexRef = useRef(
    maxToasts - visualIndex,
  );

  const exitFinishedRef = useRef(false);

  if (!isExiting) {
    frozenYRef.current = targetY;
    frozenZIndexRef.current =
      maxToasts - visualIndex;
  }

  useEffect(() => {
    if (!isExiting) {
      exitFinishedRef.current = false;
    }
  }, [isExiting]);

  useLayoutEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return;
    }

    const measure = () => {
      const height = Math.ceil(
        element.getBoundingClientRect().height,
      );

      if (height > 0) {
        onHeightChange(toast.id, height);
      }
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [onHeightChange, toast.id]);

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [onDismiss, toast.id]);

  const collapsedScale = Math.max(
    0.95,
    1 - visualIndex * 0.025,
  );

  const collapsedOpacity = Math.max(
    0.62,
    1 - visualIndex * 0.18,
  );

  const collapsedBlur = Math.min(
    0.8,
    visualIndex * 0.4,
  );

  return (
    <motion.div
      className="pointer-events-auto col-start-1 row-start-1 w-full"
      initial={{
        opacity: 0,
        x: dismissDirection * ENTER_DISTANCE,
        y: targetY,
        scale: 0.98,
        filter: "blur(2px)",
      }}
      animate={
        isExiting
          ? {
            opacity: 0,
            x: dismissDirection * EXIT_DISTANCE,
            y: frozenYRef.current,
            scale: 0.97,
            filter: "blur(2px)",
          }
          : {
            opacity: isExpanded
              ? 1
              : collapsedOpacity,
            x: 0,
            y: targetY,
            scale: isExpanded
              ? 1
              : collapsedScale,
            filter: isExpanded
              ? "blur(0px)"
              : `blur(${collapsedBlur}px)`,
          }
      }
      onPointerEnter={onExpand}
      onAnimationComplete={() => {
        if (
          !isExiting ||
          exitFinishedRef.current
        ) {
          return;
        }

        exitFinishedRef.current = true;
        onExitFinished(toast.id);
      }}
      style={{
        pointerEvents: isExiting ? "none" : "auto",
        transformOrigin: isTop
          ? "center top"
          : "center bottom",
        willChange: "transform, opacity, filter",
        zIndex: frozenZIndexRef.current + 1,
      }}
      transition={
        isExiting
          ? {
            x: {
              duration: 0.3,
              ease: EXIT_EASE,
            },
            opacity: {
              duration: 0.22,
              ease: EXIT_EASE,
            },
            scale: {
              duration: 0.3,
              ease: EXIT_EASE,
            },
            filter: {
              duration: 0.22,
              ease: EXIT_EASE,
            },
          }
          : {
            x: {
              duration: 0.34,
              ease: SMOOTH_EASE,
            },
            y: {
              duration: 0.3,
              ease: SMOOTH_EASE,
            },
            opacity: {
              duration: 0.24,
              ease: SMOOTH_EASE,
            },
            scale: {
              duration: 0.3,
              ease: SMOOTH_EASE,
            },
            filter: {
              duration: 0.24,
              ease: SMOOTH_EASE,
            },
          }
      }
    >
      <div ref={contentRef} className="w-full">
        <Toast
          description={toast.description}
          dismissDirection={dismissDirection}
          grain={toast.grain}
          icon={
            toast.icon ??
            icons?.[toast.variant] ??
            toastIconSets[iconStyle][toast.variant]
          }
          onDismiss={handleDismiss}
          showCategory={toast.showCategory}
          showDescription={toast.showDescription}
          title={toast.title}
          variant={toast.variant}
        />
      </div>
    </motion.div>
  );
}

function calculateStackPositions(
  toasts: ToastRecord[],
  heights: Record<string, number>,
  isTop: boolean,
  isExpanded: boolean,
): number[] {
  if (!isExpanded) {
    return toasts.map((_, index) =>
      isTop
        ? (toasts.length - index - 1) *
        STACK_PEEK
        : index * -STACK_PEEK,
    );
  }

  const positions = new Array<number>(
    toasts.length,
  ).fill(0);

  if (isTop) {
    let currentY = 0;

    for (
      let index = toasts.length - 1;
      index >= 0;
      index -= 1
    ) {
      const toast = toasts[index];

      positions[index] = currentY;

      currentY +=
        (heights[toast.id] ??
          DEFAULT_TOAST_HEIGHT) + EXPANDED_GAP;
    }

    return positions;
  }

  let currentY = 0;

  positions[0] = 0;

  for (
    let index = 1;
    index < toasts.length;
    index += 1
  ) {
    const toast = toasts[index];

    currentY -=
      (heights[toast.id] ??
        DEFAULT_TOAST_HEIGHT) + EXPANDED_GAP;

    positions[index] = currentY;
  }

  return positions;
}

export function ToastProvider({
  children,
  defaultOptions,
  iconStyle = "phosphor",
  icons,
  maxToasts = MAX_TOASTS,
  position = "bottom-right",
}: ToastProviderProps) {
  const visibleToastLimit = Math.max(1, Math.floor(maxToasts));

  const reduceToastStack = useCallback(
    (state: ToastStackState, action: ToastStackAction) =>
      toastStackReducer(state, action, visibleToastLimit),
    [visibleToastLimit],
  );

  const [stack, dispatch] = useReducer(
    reduceToastStack,
    initialToastStackState,
  );

  const [toastHeights, setToastHeights] =
    useState<Record<string, number>>({});

  const [isExpanded, setIsExpanded] =
    useState(false);

  const isLeft = position.endsWith("left");
  const isTop = position.startsWith("top");

  const enterDirection: -1 | 1 =
    isLeft ? -1 : 1;

  const activeToasts = useMemo(
    () =>
      stack.toasts.filter(
        (toast) =>
          toast.id !== stack.exitingId,
      ),
    [stack.exitingId, stack.toasts],
  );

  const activePositions = useMemo(
    () =>
      calculateStackPositions(
        activeToasts,
        toastHeights,
        isTop,
        isExpanded,
      ),
    [
      activeToasts,
      isExpanded,
      isTop,
      toastHeights,
    ],
  );

  const activeIndexById = useMemo(
    () =>
      new Map(
        activeToasts.map((toast, index) => [
          toast.id,
          index,
        ]),
      ),
    [activeToasts],
  );

  const hoverAreaHeight = useMemo(() => {
    if (activeToasts.length === 0) {
      return 0;
    }

    if (!isExpanded) {
      const mainToast = activeToasts[0];

      const mainHeight =
        toastHeights[mainToast.id] ??
        DEFAULT_TOAST_HEIGHT;

      return (
        mainHeight +
        Math.max(
          0,
          activeToasts.length - 1,
        ) *
        STACK_PEEK
      );
    }

    return activeToasts.reduce(
      (total, toast, index) => {
        const height =
          toastHeights[toast.id] ??
          DEFAULT_TOAST_HEIGHT;

        return (
          total +
          height +
          (index > 0 ? EXPANDED_GAP : 0)
        );
      },
      0,
    );
  }, [
    activeToasts,
    isExpanded,
    toastHeights,
  ]);

  const addToast = useCallback(
    (
      variant: ToastVariant,
      input: ToastInput,
    ) => {
      dispatch({
        type: "ADD",
        toast: {
          ...defaultOptions,
          id: crypto.randomUUID(),
          ...input,
          variant,
        },
      });
    },
    [defaultOptions],
  );

  const dismissToast = useCallback(
    (id: string) => {
      dispatch({
        type: "DISMISS",
        id,
      });
    },
    [],
  );

  const finishExit = useCallback(
    (id: string) => {
      dispatch({
        type: "EXIT_FINISHED",
        id,
      });

      setToastHeights((current) => {
        if (!(id in current)) {
          return current;
        }

        const next = { ...current };
        delete next[id];

        return next;
      });
    },
    [],
  );

  const handleHeightChange = useCallback(
    (id: string, height: number) => {
      setToastHeights((current) => {
        if (current[id] === height) {
          return current;
        }

        return {
          ...current,
          [id]: height,
        };
      });
    },
    [],
  );

  const expandStack = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapseStack = useCallback(() => {
    setIsExpanded(false);
  }, []);

  useEffect(() => {
    return registerToastDispatcher(addToast);
  }, [addToast]);

  return (
    <>
      {children}

      <section
        aria-label="Notifications"
        className={`not-prose pointer-events-none fixed z-50 grid w-[min(24rem,calc(100vw-2.5rem))] ${positions[position]}`}
        onFocusCapture={expandStack}
        onPointerEnter={expandStack}
        onPointerLeave={collapseStack}
        onBlurCapture={(event) => {
          const nextTarget =
            event.relatedTarget as Node | null;

          if (
            !nextTarget ||
            !event.currentTarget.contains(
              nextTarget,
            )
          ) {
            collapseStack();
          }
        }}
      >
        <div
          aria-hidden="true"
          className={`pointer-events-auto absolute inset-x-0 ${isTop ? "top-0" : "bottom-0"
            }`}
          onPointerEnter={expandStack}
          style={{
            height: hoverAreaHeight,
            zIndex: 0,
          }}
        />

        {stack.toasts.map((toast) => {
          const isExiting =
            toast.id === stack.exitingId;

          const activeIndex =
            activeIndexById.get(toast.id);

          const targetY =
            activeIndex === undefined
              ? 0
              : activePositions[activeIndex] ?? 0;

          return (
            <ToastStackItem
              key={toast.id}
              dismissDirection={enterDirection}
              iconStyle={iconStyle}
              icons={icons}
              isExpanded={isExpanded}
              isExiting={isExiting}
              isTop={isTop}
              onDismiss={dismissToast}
              onExpand={expandStack}
              onExitFinished={finishExit}
              onHeightChange={handleHeightChange}
              maxToasts={visibleToastLimit}
              targetY={targetY}
              toast={toast}
              visualIndex={
                activeIndex ?? visibleToastLimit
              }
            />
          );
        })}
      </section>
    </>
  );
}
