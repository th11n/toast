import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseLayoutOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Toast",
      url: "/",
    },
    themeSwitch: {
      enabled: false,
    },
  };
}
