import Link from 'next/link';
import { Reveal, SlideLines } from './Motion';

export type PageContent = {
  eyebrow: string; title: string[]; intro: string; color?: 'burgundy' | 'char' | 'sage';
  sections: { h: string; p: string; points?: string[] }[];
  note?: string;
};

const BG = { burgundy: 'bg-burgundy', char: 'bg-char', sage: 'bg-sage' };

export function PageTemplate({ c, visual }: { c: PageContent; visual?: React.ReactNode }) {
  return (
    <>
      <section className={`${BG[c.color ?? 'burgundy']} overflow-x-clip text-ivory`}>
        <div className={`mx-auto max-w-7xl px-5 py-20 md:py-28 ${visual ? 'grid items-center gap-12 lg:grid-cols-2' : ''}`}>
          <div>
            <p className="eyebrow text-ivory/70">{c.eyebrow}</p>
            <SlideLines className={`display display-shadow mt-3 max-w-5xl ${visual ? 'text-[clamp(3rem,6vw,5.5rem)]' : 'text-[clamp(3rem,8vw,6.5rem)]'}`} lines={c.title} />
            <Reveal delay={500}><p className="mt-6 max-w-2xl text-lg text-ivory/85">{c.intro}</p></Reveal>
          </div>
          {visual && <Reveal from="right" delay={250}>{visual}</Reveal>}
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-5 py-16">
        {c.sections.map((s, i) => (
          <Reveal key={s.h} from={i % 2 ? 'right' : 'left'} className="grid gap-4 border-t-2 border-char py-10 md:grid-cols-[1fr_1.4fr] md:gap-10">
            <h2 className="display text-4xl md:text-5xl">{s.h}</h2>
            <div>
              <p className="text-char/80">{s.p}</p>
              {s.points && <ul className="mt-4 space-y-2">{s.points.map((p) => <li key={p} className="flex gap-3 text-sm"><span className="mt-1.5 h-2 w-2 shrink-0 bg-burgundy" />{p}</li>)}</ul>}
            </div>
          </Reveal>
        ))}
        {c.note && <p className="mt-6 border-l-4 border-amber bg-cream p-4 text-sm text-char/80">{c.note}</p>}
        <div className="mt-12 flex gap-4"><Link href="/sign-up" className="btn btn-dark">Get started</Link><Link href="/sign-in" className="btn btn-line">Sign in</Link></div>
      </div>
    </>
  );
}
