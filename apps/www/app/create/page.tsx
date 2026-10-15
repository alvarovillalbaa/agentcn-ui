import { Configurator } from "@/components/configurator";
export const metadata = { title: "Create your kit" };
export default function CreatePage() {
  return (
    <div className="page-shell interior-page create-page">
      <div className="page-heading compact">
        <span className="overline">A good place to begin</span>
        <h1>Your app. Your agent. Your kit.</h1>
        <p>
          Choose a starting point, tune the design, and install exactly what you
          need.
        </p>
      </div>
      <Configurator />
    </div>
  );
}
