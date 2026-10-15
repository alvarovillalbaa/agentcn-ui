import Link from "next/link";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/catalog.mjs";
import documentation from "@/lib/documentation.json";
import { Preview } from "@/components/preview";
import { Command } from "@/components/command";
import { CopyButton } from "@/components/copy-button";

export function generateStaticParams() {
  return catalog.map((i) => ({ name: i.name }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = catalog.find((i) => i.name === name);
  return { title: item?.title ?? "Component", description: item?.description };
}
export default async function ComponentPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const item = catalog.find((i) => i.name === name);
  if (!item) notFound();
  const data = documentation[name as keyof typeof documentation];
  const index = catalog.findIndex((i) => i.name === name);
  const next = catalog[(index + 1) % catalog.length];
  return (
    <article className="prose component-doc">
      <div className="doc-heading">
        <span className="overline">Components / {item.category}</span>
        <h1>{item.title}</h1>
        <p>{item.description}</p>
      </div>
      <Preview name={name} code={data.example} />
      <h2 id="installation">Installation</h2>
      <p>Copy this component into your configured source directory:</p>
      <Command args={`add ${name}`} />
      <p>Or import it from the package:</p>
      <div className="code-block">
        <CopyButton
          value={`import { ${item.component} } from "@alvarovillalbaa/agentcn-ui";`}
        />
        <pre>
          <code>{`import { ${item.component} } from "@alvarovillalbaa/agentcn-ui";`}</code>
        </pre>
      </div>
      <p>
        Import <code>@alvarovillalbaa/agentcn-ui/styles.css</code> once in your
        root layout when using the package. For source installs, import the CSS
        path from your <code>agentcn.json</code>.
      </p>
      <h2 id="api">API reference</h2>
      <p>
        Props are generated from the component’s TypeScript interface. Surface
        components also accept native section attributes such as{" "}
        <code>className</code>, <code>style</code>, and <code>aria-label</code>.
      </p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {data.props.map((p) => (
              <tr key={p.name}>
                <td>
                  <code>{p.name}</code>
                </td>
                <td>
                  <code>{p.type}</code>
                </td>
                <td>{p.required ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 id="behavior">Behavior & integration</h2>
      <p>
        Interactive values are controlled by your application. Update the
        relevant props after a callback succeeds. Async action callbacks disable
        their controls while pending and display a thrown error without
        reporting success.
      </p>
      {[
        "approval-request",
        "checkpoint",
        "agent-handoff",
        "memory-panel",
        "plan-review",
      ].includes(name) && (
        <div className="callout">
          <strong>Keep the server authoritative.</strong>
          <p>
            Reviewing a decision in the interface does not authorize an
            operation. Validate the user, request, current state, and scope on
            your server before executing a callback’s action.
          </p>
        </div>
      )}
      {name === "artifact-panel" && (
        <p>
          Artifact content is displayed as escaped text. HTML, JavaScript, and
          model-generated instructions are never executed by this component.
        </p>
      )}
      {name === "source-stack" && (
        <p>
          Only absolute HTTP and HTTPS URLs become links. Invalid URLs and other
          protocols render as plain titles.
        </p>
      )}
      <h2 id="source">Source</h2>
      <details className="source-details">
        <summary>Inspect the component</summary>
        <div className="code-block">
          <CopyButton value={data.source} />
          <pre>
            <code>{data.source}</code>
          </pre>
        </div>
      </details>
      <div className="doc-next">
        <Link href={`/docs/components/${next.name}`}>Next: {next.title} →</Link>
      </div>
    </article>
  );
}
