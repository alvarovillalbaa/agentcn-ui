"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { catalog, palettes, presets } from "@/lib/catalog.mjs";
import { Demo } from "./demos";
import { CopyButton } from "./copy-button";

type Palette = keyof typeof palettes;
type Preset = keyof typeof presets;
export function Configurator() {
  const [palette, setPalette] = useState<Palette>("forest");
  const [radius, setRadius] = useState("rounded");
  const [density, setDensity] = useState("comfortable");
  const [preset, setPreset] = useState<Preset>("copilot");
  const [selected, setSelected] = useState<string[]>([...presets.copilot]);
  const [manager, setManager] = useState("npm");
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("agent-run");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = q.get("palette"),
      r = q.get("radius"),
      d = q.get("density"),
      s = q.get("components"),
      initialPreset = q.get("preset"),
      initialManager = q.get("manager");
    if (p && Object.hasOwn(palettes, p)) setPalette(p as Palette);
    if (r && ["sharp", "rounded", "soft"].includes(r)) setRadius(r);
    if (d && ["compact", "comfortable"].includes(d)) setDensity(d);
    if (initialPreset && Object.hasOwn(presets, initialPreset))
      setPreset(initialPreset as Preset);
    if (initialManager && ["npm", "pnpm"].includes(initialManager))
      setManager(initialManager);
    if (s !== null) {
      const valid = [
        ...new Set(
          s.split(",").filter((n) => catalog.some((i) => i.name === n)),
        ),
      ];
      setSelected(valid);
      setActive(valid[0] ?? "agent-run");
      if (!initialPreset) {
        const match = Object.entries(presets).find(
          ([, names]) =>
            names.length === valid.length &&
            names.every((n) => valid.includes(n)),
        );
        if (match) setPreset(match[0] as Preset);
      }
    }
  }, []);
  const color = palettes[palette];
  const style = {
    "--ac-accent": dark ? color.dark : color.accent,
    "--ac-accent-fg": dark ? color.darkForeground : color.foreground,
    "--ac-radius": { sharp: "4px", rounded: "12px", soft: "20px" }[radius],
    "--ac-space": density === "compact" ? "14px" : "20px",
  } as CSSProperties;
  const prefix = manager === "npm" ? "npx" : "pnpm dlx";
  const sourceInstall = selected.some((name) =>
    catalog.some((item) => item.name === name && item.sourceOnly),
  );
  const executable = sourceInstall
    ? "node /path/to/agentcn-ui/packages/cli/bin/agentcn.mjs"
    : `${prefix} agentcn-ui@latest`;
  const destination = sourceInstall ? " --cwd /path/to/your-app" : "";
  const commands = `${executable} init --yes --palette ${palette} --radius ${radius} --density ${density}${destination}\n${executable} add ${selected.join(" ")}${destination}`;
  const config = JSON.stringify(
    {
      $schema:
        "https://raw.githubusercontent.com/alvarovillalbaa/agentcn-ui/main/agentcn.schema.json",
      version: 1,
      components: "components/agentcn",
      css: "styles/agentcn.css",
      palette,
      radius,
      density,
    },
    null,
    2,
  );
  const query = new URLSearchParams({
    palette,
    radius,
    density,
    preset,
    manager,
    components: selected.join(","),
  }).toString();
  function choosePreset(value: Preset) {
    setPreset(value);
    setSelected([...presets[value]]);
    setActive(presets[value][0]);
  }
  function toggle(name: string) {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name],
    );
    setActive(name);
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([config + "\n"], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "agentcn.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="configurator">
      <aside className="config-options">
        <fieldset>
          <legend>01 / Starting point</legend>
          <p>A useful set of components for your app.</p>
          <div className="preset-choices">
            {(Object.keys(presets) as Preset[]).map((p) => (
              <button
                key={p}
                data-selected={p === preset}
                aria-pressed={p === preset}
                onClick={() => choosePreset(p)}
              >
                {p === "copilot"
                  ? "Agent copilot"
                  : p === "research"
                    ? "Research assistant"
                    : "Agent operations"}
                <span>{presets[p].length} components</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>02 / Make it yours</legend>
          <label className="config-label">Accent color</label>
          <div className="palette-options">
            {(Object.keys(palettes) as Palette[]).map((p) => (
              <button
                key={p}
                aria-label={`${p} palette`}
                aria-pressed={palette === p}
                onClick={() => setPalette(p)}
              >
                <span style={{ background: palettes[p].accent }} />
                {p}
              </button>
            ))}
          </div>
          <label className="config-label" htmlFor="radius">
            Corner radius
          </label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          >
            <option value="sharp">Sharp</option>
            <option value="rounded">Rounded</option>
            <option value="soft">Soft</option>
          </select>
          <label className="config-label" htmlFor="density">
            Density
          </label>
          <select
            id="density"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </fieldset>
        <fieldset>
          <legend>03 / Pick your components</legend>
          <div className="component-checkboxes">
            {catalog.map((i) => (
              <label key={i.name}>
                <input
                  type="checkbox"
                  checked={selected.includes(i.name)}
                  onChange={() => toggle(i.name)}
                />
                {i.title}
                {i.sourceOnly && <small> · source</small>}
              </label>
            ))}
          </div>
        </fieldset>
      </aside>
      <div className="config-workspace">
        <div className="config-preview-header">
          <div>
            <span className="overline">Your kit, live</span>
            <h2>Small choices. Your own system.</h2>
          </div>
          <button
            className="button button-small"
            onClick={() => setDark(!dark)}
          >
            {dark ? "☀ Light preview" : "◐ Dark preview"}
          </button>
        </div>
        <div
          className="config-canvas ac-theme"
          data-ac-theme={dark ? "dark" : "light"}
          style={style}
        >
          <div className="config-preview-tabs">
            {selected.map((name) => (
              <button
                key={name}
                aria-pressed={active === name}
                onClick={() => setActive(name)}
              >
                {catalog.find((i) => i.name === name)?.title}
              </button>
            ))}
          </div>
          {selected.length ? (
            <div className="config-demo">
              <Demo name={selected.includes(active) ? active : selected[0]} />
            </div>
          ) : (
            <div className="empty-state">
              <h3>Your kit starts here.</h3>
              <p>Select a component to preview it.</p>
            </div>
          )}
        </div>
        <div className="config-install">
          <div className="section-heading">
            <div>
              <span className="overline">04 / Bring it to your app</span>
              <h2>{selected.length} components. Yours to change.</h2>
            </div>
            <div className="manager-switch">
              {["npm", "pnpm"].map((m) => (
                <button
                  key={m}
                  aria-pressed={manager === m}
                  disabled={sourceInstall}
                  onClick={() => setManager(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          {sourceInstall ? (
            <p>
              This kit includes components available in repository source; npm
              0.1.0 does not include them. Build a reviewed agentcn-ui checkout
              with <code>npm ci</code> and <code>npm run build:library</code>,
              then replace the example paths below with your checkout and app.
              <a href="https://github.com/alvarovillalbaa/agentcn-ui">
                {" "}
                Open source ↗
              </a>
            </p>
          ) : (
            <p>Run these commands inside your React or Next.js project.</p>
          )}
          {selected.length > 0 && (
            <div className="command-box">
              <div className="command-toolbar">
                <span className="overline">Terminal</span>
                <CopyButton value={commands} label="Copy commands" />
              </div>
              <pre>
                <code>{commands}</code>
              </pre>
            </div>
          )}
          <p className="install-note">
            Import <code>styles/agentcn.css</code> once in your root layout.
            Your components live in <code>components/agentcn</code>.
          </p>
          <div className="config-export">
            <button className="button" onClick={download}>
              ↓ Download agentcn.json
            </button>
            <CopyButton
              value={
                typeof window === "undefined"
                  ? `/create?${query}`
                  : `${window.location.origin}${window.location.pathname}?${query}`
              }
              label="Share this kit"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
