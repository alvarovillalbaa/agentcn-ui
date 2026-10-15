"use client";
import Link from "next/link";
import { useState } from "react";
import { catalog } from "@/lib/catalog.mjs";
import { Demo } from "./demos";
export function ComponentGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All components");
  const categories = [
    "All components",
    ...new Set(catalog.map((i) => i.category)),
  ];
  const visible = catalog.filter(
    (i) =>
      (category === "All components" || i.category === category) &&
      `${i.title} ${i.description} ${i.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="gallery-toolbar">
        <div className="filter-tabs" aria-label="Filter by category">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-field">
          <span className="sr-only">Search components</span>
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components…"
            type="search"
          />
        </label>
      </div>
      <p className="result-count" role="status">
        {visible.length} {visible.length === 1 ? "component" : "components"}
      </p>
      <div className="component-grid">
        {visible.map((item) => (
          <article className="gallery-card" key={item.name}>
            <div className="gallery-preview">
              <Demo name={item.name} />
            </div>
            <div className="gallery-meta">
              <div>
                <span className="overline">{item.category}</span>
                <h2>
                  <Link href={`/docs/components/${item.name}`}>
                    {item.title} <span aria-hidden="true">↗</span>
                  </Link>
                </h2>
                <p>{item.description}</p>
              </div>
              <Link
                className="text-link"
                href={`/docs/components/${item.name}`}
              >
                View documentation →
              </Link>
            </div>
          </article>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="empty-state">
          <h2>No matching components</h2>
          <p>Try “context”, “approval”, or a different category.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setCategory("All components");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
