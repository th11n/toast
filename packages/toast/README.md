# @th1n/toast

A polished, animated toast component for React. It supports stacking, swipe-to-dismiss, automatic dismissal, four variants, and Tailwind CSS styling.

[Website](https://toast.dominikkrakowiak.com) · [Documentation](https://toast.dominikkrakowiak.com/docs)

## Installation

```bash
npm install @th1n/toast framer-motion
```

`react`, `react-dom`, and `framer-motion` are peer dependencies.

## Tailwind CSS setup

This package ships Tailwind utility classes. Ensure Tailwind scans the package distribution directory.

For Tailwind CSS v4, add this to your main CSS file:

```css
@import "tailwindcss";
@source "../node_modules/@th1n/toast/dist";
```

Adjust the relative path if your CSS file is located elsewhere.

## Usage

Add `ToastProvider` once near the root of your application:

```tsx
import { ToastProvider, toast } from "@th1n/toast";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider position="bottom-right">
      {children}
    </ToastProvider>
  );
}

toast.success("Saved", "Your changes are safe.");
toast.info("New version available");
toast.warning("Your session expires soon");
toast.error("Could not save changes");
```

Pass an options object to customize an individual toast:

```tsx
toast.success("Saved", {
  description: "Your changes are safe.",
  duration: 8_000,
  showCategory: false,
  icon: <CustomSuccessIcon />,
});
```

Set `duration: 0` to keep a toast open until it is dismissed.

## Provider options

```tsx
<ToastProvider
  position="top-right"
  maxToasts={4}
  iconStyle="lucide"
  defaultOptions={{ duration: 6_000, grain: true }}
>
  {children}
</ToastProvider>
```

Available positions: `top-left`, `top-right`, `bottom-left`, and `bottom-right`.

Built-in icon styles: `phosphor` (default), `lucide`, and `react-icons`. You can also override individual variant icons with the `icons` provider prop or the `icon` toast option.

## API

`toast.success`, `toast.info`, `toast.warning`, and `toast.error` accept:

```ts
toast.success(title, descriptionOrOptions);
```

Options include `description`, `duration`, `className`, `style`, `icon`, `grain`, `showCategory`, and `showDescription`.

## License

MIT
