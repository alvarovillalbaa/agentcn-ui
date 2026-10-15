import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import "@alvarovillalbaa/agentcn-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "agentcn/ui — Interfaces for apps that think.",
    template: "%s — agentcn/ui",
  },
  description:
    "Open-source React components for AI-native apps. Agent runs, approvals, context, memory, artifacts, and evaluation. Install a package or own the source.",
};
const themeScript = `try{var t=localStorage.getItem('agentcn-theme');document.documentElement.dataset.acTheme=t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch(e){}`;
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <Link className="brand footer-brand" href="/">
            agentcn<span className="brand-muted">/ui</span>
          </Link>
          <p>Built for the next kind of software.</p>
          <div>
            <a href="https://github.com/alvarovillalbaa/agentcn-ui">
              Open source ↗
            </a>
            <a href="https://github.com/alvarovillalbaa/agentcn-ui/blob/main/LICENSE">
              MIT license
            </a>
          </div>
          <span>By Alvaro Villalba</span>
        </footer>
      </body>
    </html>
  );
}
