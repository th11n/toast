import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toast, ToastProvider, toast } from "../src";
import {
  initialToastStackState,
  MAX_TOASTS,
  toastStackReducer,
} from "../src/provider";
import type { ToastRecord, ToastVariant } from "../src/types";

function makeToast(id: string, variant: ToastVariant = "info"): ToastRecord {
  return {
    id,
    title: id,
    variant,
  };
}

function reduceStack(actions: Parameters<typeof toastStackReducer>[1][]) {
  return actions.reduce(
    (state, action) => toastStackReducer(state, action),
    initialToastStackState,
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Toast", () => {
  it("renders title and description", () => {
    render(<Toast description="Your changes are safe." title="Saved" />);

    expect(screen.getByRole("status").textContent).toContain("Saved");
    expect(screen.getByRole("status").textContent).toContain(
      "Your changes are safe.",
    );
  });

  it("uses status roles for passive variants and an alert role for errors", () => {
    render(
      <>
        <Toast title="Saved" variant="success" />
        <Toast title="Updated" variant="info" />
        <Toast title="Review needed" variant="warning" />
        <Toast title="Could not save" variant="error" />
      </>,
    );

    expect(screen.getAllByRole("status")).toHaveLength(3);
    expect(screen.getByRole("alert").textContent).toContain("Could not save");
  });

  it("renders Phosphor defaults and permits a custom icon", () => {
    const { rerender } = render(<Toast title="Saved" />);

    expect(screen.getByRole("status").querySelector("svg")).toBeTruthy();

    rerender(
      <Toast
        icon={<span data-testid="custom-icon">Custom</span>}
        title="Saved"
      />,
    );

    expect(screen.getByTestId("custom-icon").textContent).toBe("Custom");
  });

  it("hides description and category independently", () => {
    render(
      <>
        <Toast
          description="Hidden description"
          showDescription={false}
          title="A"
        />
        <Toast showCategory={false} title="B" />
      </>,
    );

    expect(screen.queryByText("Hidden description")).toBeNull();
    expect(screen.getByText("Information")).toBeTruthy();
    expect(screen.getByText("B").previousElementSibling).toBeNull();
  });

  it("adds the demo noise GIF only when grain is enabled", () => {
    const { rerender } = render(<Toast title="No grain" />);

    expect(
      screen.getByRole("status").querySelector("[style*='noise.gif']"),
    ).toBeNull();

    rerender(<Toast grain title="Grain" />);

    expect(
      screen.getByRole("status").querySelector("[style*='noise.gif']"),
    ).toBeTruthy();
  });

  it("merges custom card classes and inline styles", () => {
    render(
      <Toast
        className="rounded-none bg-indigo-950"
        style={{ boxShadow: "none" }}
        title="Styled"
      />,
    );

    const notification = screen.getByRole("status");
    expect(notification.className).toContain("rounded-none");
    expect(notification.className).toContain("bg-indigo-950");
    expect(notification.style.boxShadow).toBe("none");
  });

  it("auto-dismisses exactly after five seconds and cleans up its timer", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { unmount } = render(<Toast onDismiss={onDismiss} title="Saved" />);

    act(() => vi.advanceTimersByTime(4_999));
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onDismiss).toHaveBeenCalledTimes(1);

    unmount();
    act(() => vi.advanceTimersByTime(10_000));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe("toast global API and provider", () => {
  it("is safe to call before a provider is mounted", () => {
    expect(() => toast.info("No provider")).not.toThrow();
  });

  it("supports the legacy description argument", () => {
    render(<ToastProvider>Application</ToastProvider>);

    act(() => toast.success("Saved", "Your changes are safe."));

    expect(screen.getByRole("status").textContent).toContain(
      "Your changes are safe.",
    );
  });

  it("applies all display options passed through the global API", () => {
    render(<ToastProvider>Application</ToastProvider>);

    act(() => {
      toast.success("Saved", {
        description: "Hidden description",
        grain: true,
        showCategory: false,
        showDescription: false,
      });
    });

    const notification = screen.getByRole("status");
    expect(notification.textContent).toContain("Saved");
    expect(notification.textContent).not.toContain("Hidden description");
    expect(notification.textContent).not.toContain("Success");
    expect(notification.querySelector("[style*='noise.gif']")).toBeTruthy();
  });

  it("uses provider defaults and lets a toast override each option", () => {
    render(
      <ToastProvider
        defaultOptions={{
          description: "Provider description",
          duration: 0,
          grain: true,
          showCategory: false,
          showDescription: true,
        }}
      >
        Application
      </ToastProvider>,
    );

    act(() => toast.info("From provider"));

    const providerToast = screen.getByRole("status");
    expect(providerToast.textContent).toContain("Provider description");
    expect(providerToast.textContent).not.toContain("Information");
    expect(providerToast.querySelector("[style*='noise.gif']")).toBeTruthy();

    act(() => {
      toast.error("Overridden", {
        description: "Toast description",
        grain: false,
        showCategory: true,
        showDescription: false,
      });
    });

    const toastOverride = screen.getByRole("alert");
    expect(toastOverride.textContent).toContain("Error");
    expect(toastOverride.textContent).not.toContain("Toast description");
    expect(toastOverride.querySelector("[style*='noise.gif']")).toBeNull();
  });

  it("uses provider icons and lets a single toast override them", () => {
    render(
      <ToastProvider
        icons={{ info: <span data-testid="provider-icon">Provider</span> }}
      >
        Application
      </ToastProvider>,
    );

    act(() => {
      toast.info("Provider icon");
      toast.info("Toast icon", {
        icon: <span data-testid="toast-icon">Toast</span>,
      });
    });

    expect(screen.getByTestId("provider-icon").textContent).toBe("Provider");
    expect(screen.getByTestId("toast-icon").textContent).toBe("Toast");
  });

  it("renders a ready-made icon set selected on the provider", () => {
    render(
      <ToastProvider iconStyle="lucide">Application</ToastProvider>,
    );

    act(() => toast.success("Saved"));

    expect(
      screen.getByRole("status").querySelector("svg.lucide-circle-check"),
    ).toBeTruthy();
  });

  it("applies the requested viewport position", () => {
    render(<ToastProvider position="top-left">Application</ToastProvider>);

    expect(screen.getByLabelText("Notifications").className).toContain(
      "top-5 left-5",
    );
  });
});

describe("toast stack reducer", () => {
  it("places newer toasts in front of the stack", () => {
    const state = reduceStack([
      { type: "ADD", toast: makeToast("one") },
      { type: "ADD", toast: makeToast("two") },
      { type: "ADD", toast: makeToast("three") },
    ]);

    expect(state.toasts.map((toast) => toast.id)).toEqual([
      "three",
      "two",
      "one",
    ]);
    expect(state.exitingId).toBeNull();
  });

  it("keeps the incoming toast while the oldest card exits from a full stack", () => {
    const state = reduceStack([
      { type: "ADD", toast: makeToast("one") },
      { type: "ADD", toast: makeToast("two") },
      { type: "ADD", toast: makeToast("three") },
      { type: "ADD", toast: makeToast("four") },
    ]);

    expect(state.toasts).toHaveLength(MAX_TOASTS + 1);
    expect(state.toasts.map((toast) => toast.id)).toEqual([
      "four",
      "three",
      "two",
      "one",
    ]);
    expect(state.exitingId).toBe("one");
  });

  it("uses a custom visible-card limit", () => {
    const state = ["one", "two", "three"].reduce(
      (current, id) =>
        toastStackReducer(current, { type: "ADD", toast: makeToast(id) }, 2),
      initialToastStackState,
    );

    expect(state.toasts.map((toast) => toast.id)).toEqual([
      "three",
      "two",
      "one",
    ]);
    expect(state.exitingId).toBe("one");
  });

  it("queues additions during an exit and starts the next replacement", () => {
    const beforeExitCompletes = reduceStack([
      { type: "ADD", toast: makeToast("one") },
      { type: "ADD", toast: makeToast("two") },
      { type: "ADD", toast: makeToast("three") },
      { type: "ADD", toast: makeToast("four") },
      { type: "ADD", toast: makeToast("five") },
    ]);

    const afterExitCompletes = toastStackReducer(beforeExitCompletes, {
      id: "one",
      type: "EXIT_FINISHED",
    });

    expect(beforeExitCompletes.queuedToasts.map((toast) => toast.id)).toEqual([
      "five",
    ]);
    expect(afterExitCompletes.toasts.map((toast) => toast.id)).toEqual([
      "five",
      "four",
      "three",
      "two",
    ]);
    expect(afterExitCompletes.exitingId).toBe("two");
  });

  it("serializes dismissals and ignores unknown or duplicate ids", () => {
    const initial = reduceStack([
      { type: "ADD", toast: makeToast("one") },
      { type: "ADD", toast: makeToast("two") },
      { type: "ADD", toast: makeToast("three") },
    ]);

    const firstDismissal = toastStackReducer(initial, {
      id: "two",
      type: "DISMISS",
    });
    const queuedDismissal = toastStackReducer(firstDismissal, {
      id: "three",
      type: "DISMISS",
    });
    const duplicateDismissal = toastStackReducer(queuedDismissal, {
      id: "three",
      type: "DISMISS",
    });
    const unknownDismissal = toastStackReducer(duplicateDismissal, {
      id: "unknown",
      type: "DISMISS",
    });
    const nextExit = toastStackReducer(unknownDismissal, {
      id: "two",
      type: "EXIT_FINISHED",
    });

    expect(firstDismissal.exitingId).toBe("two");
    expect(queuedDismissal.queuedDismissals).toEqual(["three"]);
    expect(unknownDismissal).toEqual(duplicateDismissal);
    expect(nextExit.exitingId).toBe("three");
  });
});
