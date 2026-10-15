export default function Loading() {
  return (
    <div className="page-shell loading-page" role="status">
      <span className="loading-mark" aria-hidden="true">
        ✳
      </span>{" "}
      Loading the workspace…
    </div>
  );
}
