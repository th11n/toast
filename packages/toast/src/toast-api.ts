import type { ToastInput, ToastOptions, ToastVariant } from "./types";

type ToastDispatcher = (variant: ToastVariant, input: ToastInput) => void;

let dispatchToast: ToastDispatcher | null = null;

function isToastOptions(value: unknown): value is ToastOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("description" in value ||
      "duration" in value ||
      "grain" in value ||
      "icon" in value ||
      "showCategory" in value ||
      "showDescription" in value)
  );
}

export function registerToastDispatcher(dispatcher: ToastDispatcher) {
  dispatchToast = dispatcher;

  return () => {
    if (dispatchToast === dispatcher) {
      dispatchToast = null;
    }
  };
}

function createToast(
  variant: ToastVariant,
  title: ToastInput["title"],
  descriptionOrOptions?: ToastInput["description"] | ToastOptions,
) {
  const options: ToastOptions = isToastOptions(descriptionOrOptions)
    ? descriptionOrOptions
    : descriptionOrOptions === undefined
      ? {}
      : { description: descriptionOrOptions as ToastInput["description"] };

  dispatchToast?.(variant, { title, ...options });
}

export const toast = {
  success(
    title: ToastInput["title"],
    descriptionOrOptions?: ToastInput["description"] | ToastOptions,
  ) {
    createToast("success", title, descriptionOrOptions);
  },
  info(
    title: ToastInput["title"],
    descriptionOrOptions?: ToastInput["description"] | ToastOptions,
  ) {
    createToast("info", title, descriptionOrOptions);
  },
  warning(
    title: ToastInput["title"],
    descriptionOrOptions?: ToastInput["description"] | ToastOptions,
  ) {
    createToast("warning", title, descriptionOrOptions);
  },
  error(
    title: ToastInput["title"],
    descriptionOrOptions?: ToastInput["description"] | ToastOptions,
  ) {
    createToast("error", title, descriptionOrOptions);
  },
};
