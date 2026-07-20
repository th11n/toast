# @dominikkrakowiak/toast

Komponent React rozwijany w tym monorepo.

## Instalacja

```sh
bun add @dominikkrakowiak/toast
```

## Tailwind CSS

Pakiet używa klas Tailwind. W aplikacji konsumenta dodaj katalog dystrybucyjny pakietu do źródeł Tailwinda, np. w CSS Tailwind v4:

```css
@source "../node_modules/@dominikkrakowiak/toast/dist";
```

## Użycie

```tsx
import { toast, ToastProvider } from "@dominikkrakowiak/toast";

<ToastProvider position="bottom-right">{children}</ToastProvider>;

toast.success("Saved", "Your changes are safe.");
toast.info("New version available");
toast.warning("Session expires soon");
toast.error("Could not save changes");

toast.success("Saved", {
  icon: <CustomSuccessIcon />,
  showCategory: false,
  showDescription: false,
});
```

## Icons

Phosphor `duotone` icons are used by default. Set provider-wide defaults or override one toast:

```tsx
<ToastProvider icons={{ error: <CustomErrorIcon /> }}>
  {children}
</ToastProvider>;
```

Zainstaluj również `framer-motion`, ponieważ jest peer dependency pakietu.
