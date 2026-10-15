"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
export function Header() {
  const path = usePathname();
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.dataset.acTheme === "dark");
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.acTheme = next ? "dark" : "light";
    try {
      localStorage.setItem("agentcn-theme", next ? "dark" : "light");
    } catch {
      /* Storage may be disabled. */
    }
  }
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="agentcn-ui home">
          <span className="brand-mark" aria-hidden="true">
            a<span>↗</span>
          </span>
          <span>
            agentcn<span className="brand-muted">/ui</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary">
          {[
            ["/docs", "Documentation"],
            ["/components", "Components"],
            ["/blocks", "Blocks"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              data-active={path === href || path.startsWith(href + "/")}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <a
            className="github-link"
            href="https://github.com/alvarovillalbaa/agentcn-ui"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <button
            className="icon-button"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? "☀" : "◐"}
          </button>
          <Link className="button button-dark header-create" href="/create">
            Create your kit <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="icon-button mobile-menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            ☰
          </button>
        </div>
      </div>
      {menu && (
        <nav className="mobile-nav" aria-label="Mobile">
          {[
            ["/docs", "Documentation"],
            ["/components", "Components"],
            ["/blocks", "Blocks"],
            ["/create", "Create your kit"],
          ].map(([href, label]) => (
            <Link href={href} key={href} onClick={() => setMenu(false)}>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
