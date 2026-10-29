import { ComponentGallery } from "@/components/component-gallery";
import { catalog } from "@/lib/catalog.mjs";
export const metadata = { title: "Components" };
export default function ComponentsPage() {
  return (
    <div className="page-shell interior-page">
      <div className="page-heading">
        <span className="overline">The library</span>
        <h1>
          A vocabulary for
          <br />
          AI-native interfaces.
        </h1>
        <p>
          {catalog.length} focused components. Real interactions, typed APIs,
          and source code you can make your own.
        </p>
      </div>
      <ComponentGallery />
    </div>
  );
}
