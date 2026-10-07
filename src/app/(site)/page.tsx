import Link from 'next/link';
import { HeroScene } from '@/components/HeroScene';
import { Marquee, Reveal, SlideLines } from '@/components/Motion';

const ticker = ['Visual inspection', 'Quality intelligence', 'Operational context', 'Batch & lot signals', 'Supplier patterns', 'Prioritized action'].map((label, i) => ({
  label, color: ['#b8324a', '#4f7a5a', '#b7791f', '#7a1f2b', '#3a2d2a', '#b8324a'][i], icon: <span className="block h-4 w-4 rounded-full bg-white/90" />,
}));

const steps = [
  { n: '01', t: 'See', d: 'Upload product, packaging, label or line images. Vision analysis returns structured findings, each with its observed evidence kept separate from interpretation.', bg: 'bg-burgundy text-ivory' },
  { n: '02', t: 'Understand', d: 'Findings are placed in context: product, batch, line, facility, supplier and time. Recurring patterns surface as signals, not guesses.', bg: 'bg-cream text-char' },
  { n: '03', t: 'Investigate', d: 'Open an incident, gather evidence, and let agents organize related patterns and possible contributors — always labelled as requiring review.', bg: 'bg-char text-ivory' },
  { n: '04', t: 'Act', d: 'Turn intelligence into owned, prioritized corrective actions with deadlines and a definition of done. Outcomes feed back into context.', bg: 'bg-sage text-white' },
];

const caps = [
  ['AI Visual Inspection', 'Structured findings from images with confidence and limits.'],
  ['Product Quality Classification', 'Your own categories, with the reasoning shown.'],
  ['Packaging Intelligence', 'Repeated packaging issues tied to batch, line and supplier.'],
  ['Label Inspection', 'Visible text and consistency checks; formal verification flagged.'],
  ['Production Quality Intelligence', 'Defect patterns by line, shift and period.'],
  ['Food-Safety Intelligence', 'Organizes evidence; never claims lab-level detection.'],
  ['HACCP Intelligence', 'Hazards, CCPs, deviations and corrective actions in one view.'],
  ['Supplier Quality Intelligence', 'Supplier trends with the evidence behind each signal.'],
  ['Batch / Lot Intelligence', 'Which lots may warrant additional review, and why.'],
  ['Anomaly Detection', 'Only when a real historical baseline exists.'],
  ['Incident Investigation', 'Evidence, patterns, possible contributors, next steps.'],
  ['Recall Intelligence', 'Scope analysis to support — never replace — human decisions.'],
];

const agents = [
  ['Inspection Agent', 'Structures findings from visual evidence.'],
  ['Quality Agent', 'Connects findings to broader quality trends.'],
  ['Food Safety Intelligence Agent', 'Flags areas needing qualified review.'],
  ['Supplier Risk Agent', 'Reads supplier patterns and shows its evidence.'],
  ['Incident Investigation Agent', 'Organizes evidence and possible contributors.'],
  ['Recall Intelligence Agent', 'Maps potentially related batches for human review.'],
  ['Quality Operations Agent', 'Turns intelligence into prioritized actions.'],
];

const story = ['Defect detected', 'Similar defects increasing', 'Pattern associated with production line', 'Potentially affected batches identified', 'Investigation opened', 'Prioritized actions created'];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="scallop-bottom relative overflow-hidden bg-burgundy text-ivory" style={{ ['--edge' as string]: '#231a18' }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-28 pt-14 md:grid-cols-2 md:pb-32 md:pt-20">
          <div>
            <p className="eyebrow reveal" data-in="true" style={{ animation: 'slideUp .8s both' }}>AI Food Quality &amp; Operations Intelligence</p>
            <SlideLines className="display display-shadow mt-4 text-[clamp(3rem,7vw,6.5rem)]" lines={['See the defect.', 'Understand', 'the pattern.', 'Act before it spreads.']} />
            <Reveal delay={700}>
              <p className="mt-7 max-w-xl text-lg text-ivory/85">FoodVision AI combines computer vision with production, batch, supplier and quality data to turn inspections into operational intelligence, investigations and prioritized action.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/sign-up" className="btn btn-dark">Get started</Link>
                <Link href="/sign-in" className="btn btn-line">Sign in</Link>
              </div>
              <p className="eyebrow mt-8 text-ivory/70">Visual inspection · Quality intelligence · Operational context</p>
            </Reveal>
          </div>
          <Reveal from="right" delay={200}><HeroScene /></Reveal>
        </div>
      </section>

      <section className="bg-char py-7 pt-10"><Marquee items={ticker} /></section>

      {/* VISION TO INTELLIGENCE */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal><p className="eyebrow text-burgundy">From vision to intelligence</p></Reveal>
        <Reveal><h2 className="display mt-2 max-w-4xl text-[clamp(2.8rem,6vw,5.5rem)]">A finding is only the start of the story.</h2></Reveal>
        <Reveal delay={100}><p className="mt-5 max-w-2xl text-lg text-char/75">Visual findings become far more valuable when connected to operational context. FoodVision AI moves from what was seen to what it may mean and what to do next.</p></Reveal>
        <div className="mt-12 grid gap-0 md:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.t} from={i % 2 ? 'right' : 'left'} delay={i * 120} className={`${s.bg} p-8 md:min-h-[360px]`}>
              <span className="display text-6xl opacity-40">{s.n}</span>
              <h3 className="display mt-6 text-5xl">{s.t}</h3>
              <p className="mt-4 text-sm leading-relaxed opacity-90">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal><p className="eyebrow text-burgundy">Core AI capabilities</p></Reveal>
          <Reveal><h2 className="display mt-2 max-w-4xl text-[clamp(2.8rem,6vw,5.5rem)]">One quality intelligence system — not twelve tools.</h2></Reveal>
          <Reveal><p className="mt-5 max-w-2xl text-char/75">Every capability reads from, and writes back to, the same organizational context: products, batches, lines, suppliers, incidents and actions.</p></Reveal>
          <ul className="mt-12 grid gap-px bg-char/20 sm:grid-cols-2 lg:grid-cols-3">
            {caps.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={(i % 3) * 90} className="group bg-cream p-7 transition-colors hover:bg-burgundy hover:text-ivory">
                <span className="display text-3xl text-rose group-hover:text-ivory/60">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display mt-3 text-3xl">{t}</h3>
                <p className="mt-2 text-sm opacity-80">{d}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* AGENTS */}
      <section className="bg-char py-24 text-ivory">
        <div className="mx-auto max-w-7xl px-5">
          <Reveal><p className="eyebrow text-rose">The agent system</p></Reveal>
          <Reveal><h2 className="display mt-2 max-w-4xl text-[clamp(2.8rem,6vw,5.5rem)]">Specialized AI agents for the quality operation.</h2></Reveal>
          <Reveal><p className="mt-5 max-w-2xl text-ivory/75">Agents do not sit in separate chat windows. Each one hands structured findings to the next — an inspection result informs the quality trend, which informs supplier analysis, batch scope, investigation and finally prioritized action.</p></Reveal>
          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {agents.map(([t, d], i) => (
              <Reveal as="li" key={t} from={i % 2 ? 'right' : 'left'} delay={i * 80} className="relative border border-white/20 p-6">
                <span className="eyebrow text-rose">Step {i + 1}</span>
                <h3 className="display mt-2 text-3xl">{t}</h3>
                <p className="mt-2 text-sm text-ivory/70">{d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* EXAMPLE INVESTIGATION */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal><p className="eyebrow text-burgundy">Example investigation · Illustrative</p></Reveal>
        <Reveal><h2 className="display mt-2 max-w-3xl text-[clamp(2.8rem,6vw,5rem)]">From one defect to a prioritized plan.</h2></Reveal>
        <ol className="mt-12 grid gap-0 md:grid-cols-6">
          {story.map((s, i) => (
            <Reveal as="li" key={s} delay={i * 130} className={`${i % 2 ? 'bg-sand' : 'bg-cream'} relative p-6 md:min-h-[220px]`}>
              <span className="display text-5xl text-burgundy">{i + 1}</span>
              <p className="display mt-3 text-2xl">{s}</p>
            </Reveal>
          ))}
        </ol>
        <p className="mt-4 text-xs text-char/60">Illustrative workflow only. It contains no customer data or real results. Patterns are described as associations that require investigation, not confirmed root causes.</p>
      </section>

      {/* CTA */}
      <section className="scallop-bottom bg-burgundy py-24 text-center text-ivory" style={{ ['--edge' as string]: '#231a18' }}>
        <div className="mx-auto max-w-4xl px-5">
          <Reveal from="pop"><h2 className="display display-shadow text-[clamp(3rem,8vw,6.5rem)]">Turn every inspection into intelligence.</h2></Reveal>
          <Reveal delay={150}><p className="mx-auto mt-6 max-w-2xl text-lg text-ivory/85">Give your quality team the context to understand what changed, investigate why and decide what needs to happen next.</p></Reveal>
          <Reveal delay={250}><div className="mt-9 flex flex-wrap justify-center gap-4"><Link href="/sign-up" className="btn btn-dark">Get started</Link><Link href="/sign-in" className="btn btn-line">Sign in</Link></div></Reveal>
        </div>
      </section>
      <div className="h-6 bg-char" />
    </>
  );
}
