import { notFound } from "next/navigation";
import { guideContent } from "@/lib/guide-content";
export function generateStaticParams() {
  return Object.keys(guideContent).map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: guideContent[slug]?.title ?? "Documentation" };
}
export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideContent[slug];
  if (!guide) notFound();
  return (
    <article className="prose">
      <div className="doc-heading">
        <span className="overline">Documentation / Get started</span>
        <h1>{guide.title}</h1>
        <p>{guide.description}</p>
      </div>
      {guide.content}
    </article>
  );
}
