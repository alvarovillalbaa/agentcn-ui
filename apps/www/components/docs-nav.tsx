"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { catalog } from "@/lib/catalog.mjs";
export const guides = [
  ["/docs", "Introduction"],
  ["/docs/installation", "Installation"],
  ["/docs/ownership", "Package or source?"],
  ["/docs/configuration", "Configuration"],
  ["/docs/theming", "Theming"],
  ["/docs/runtime-integration", "Connect your runtime"],
  ["/docs/accessibility", "Accessibility"],
  ["/docs/cli", "CLI reference"],
];
export function DocsNav() {
  const path = usePathname();
  return (
    <nav className="docs-nav" aria-label="Documentation">
      <div className="docs-nav-section">
        <span className="overline">Get started</span>
        {guides.map(([href, title]) => (
          <Link
            href={href}
            key={href}
            aria-current={path === href ? "page" : undefined}
          >
            {title}
          </Link>
        ))}
      </div>
      {[...new Set(catalog.map((i) => i.category))].map((category) => (
        <div className="docs-nav-section" key={category}>
          <span className="overline">{category}</span>
          {catalog
            .filter((i) => i.category === category)
            .map((i) => (
              <Link
                key={i.name}
                href={`/docs/components/${i.name}`}
                aria-current={
                  path === `/docs/components/${i.name}` ? "page" : undefined
                }
              >
                {i.title}
              </Link>
            ))}
        </div>
      ))}
    </nav>
  );
}
