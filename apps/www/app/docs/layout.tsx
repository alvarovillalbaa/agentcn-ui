import type { ReactNode } from "react";
import { DocsNav } from "@/components/docs-nav";
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell docs-layout">
      <aside className="docs-sidebar">
        <DocsNav />
      </aside>
      <div className="docs-content">{children}</div>
    </div>
  );
}
