import Link from 'next/link';
import { PLANS, paymentLink, planCredits } from '@/lib/pricing';
import { Reveal, SlideLines } from '@/components/Motion';

export const metadata = { title: 'Pricing' };
export const dynamic = 'force-dynamic';

export default function Pricing() {
  return (
    <>
      <section className="bg-burgundy text-ivory">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <p className="eyebrow text-ivory/70">Pricing</p>
          <SlideLines className="display display-shadow mt-3 text-[clamp(3rem,8vw,6.5rem)]" lines={['Credit-based plans.', 'Simple monthly price.']} />
          <p className="mt-6 max-w-2xl text-ivory/85">Each plan includes a monthly allowance of AI credits. Image analysis, investigations, reports and agent runs consume credits server-side.</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-16 md:grid-cols-3">
        {PLANS.map((p, i) => {
          const link = paymentLink(p.id); const credits = planCredits(p.id);
          return (
            <Reveal key={p.id} delay={i * 120} className={`flex flex-col border-2 border-char p-7 ${p.id === 'professional' ? 'bg-cream' : 'bg-white'}`}>
              <h2 className="display text-4xl">{p.name}</h2>
              <p className="display mt-3 text-7xl text-burgundy">${p.price}<span className="text-2xl text-char/60">/month</span></p>
              <p className="mt-3 text-sm text-char/75">{p.blurb}</p>
              <p className="mt-4 text-sm font-bold">{credits ? `${credits.toLocaleString()} AI credits / month` : 'Monthly AI credits — allowance to be announced'}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">{p.highlights.map((h) => <li key={h} className="flex gap-2"><span className="mt-1.5 h-2 w-2 shrink-0 bg-sage" />{h}</li>)}</ul>
              {link ? <a href={link} rel="noopener" className="btn btn-dark mt-6 justify-center">Choose {p.name}</a>
                : <span className="mt-6 block bg-sand p-3 text-center text-sm font-bold">Payment link coming soon</span>}
            </Reveal>
          );
        })}
      </div>
      <p className="mx-auto max-w-3xl px-5 pb-16 text-center text-sm text-char/60">Payments are completed on your payment provider’s hosted page. <Link href="/sign-up" className="underline">Create an account</Link> first so your plan can be linked to your organization.</p>
    </>
  );
}
