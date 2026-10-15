"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-shell empty-state">
      <h1>Something interrupted this page.</h1>
      <p>Your installation hasn’t been changed. Try loading the page again.</p>
      <button className="button button-dark" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
