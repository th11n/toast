import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseLayoutOptions } from "../../lib/layout.shared";
import { source } from "../../lib/source";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseLayoutOptions()}>
      {children}
    </DocsLayout>
  );
}
