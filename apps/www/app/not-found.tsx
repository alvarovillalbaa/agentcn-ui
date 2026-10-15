import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-shell empty-state not-found">
      <span className="overline">404 / Uncharted territory</span>
      <h1>This page isn’t here.</h1>
      <p>The component catalog is a good place to pick things up.</p>
      <Link className="button button-dark" href="/components">
        Explore components →
      </Link>
    </div>
  );
}
