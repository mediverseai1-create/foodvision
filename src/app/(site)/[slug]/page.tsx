import { notFound } from 'next/navigation';
import { PageTemplate } from '@/components/PageTemplate';
import { StructuredFindingVisual } from '@/components/StructuredFindingVisual';
import { PAGES } from '@/lib/marketing';

export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(PAGES).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: PAGES[slug]?.eyebrow };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = PAGES[slug];
  if (!c) notFound();
  return <PageTemplate c={c} visual={slug === 'ai-inspection' ? <StructuredFindingVisual /> : undefined} />;
}
