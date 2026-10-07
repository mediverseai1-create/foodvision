/** Illustrative contrast: a loose paragraph vs a structured, reviewable finding. Sample content only. */
const Row = ({ k, v, tone }: { k: string; v: React.ReactNode; tone?: string }) => (
  <div className="grid grid-cols-[110px_1fr] gap-3 border-b border-char/10 py-2 text-sm last:border-0">
    <dt className="text-[11px] font-extrabold uppercase tracking-wider text-char/55">{k}</dt>
    <dd className={tone}>{v}</dd>
  </div>
);

export function StructuredFindingVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label="Illustrative comparison of a paragraph and a structured finding">
      <div className="mb-5 border border-dashed border-ivory/40 p-3">
        <p className="eyebrow !text-xs text-ivory/60">A paragraph answer</p>
        <p className="mt-1 text-sm italic leading-relaxed text-ivory/60 line-through decoration-ivory/40">“The jar may have a slightly irregular seal and the label looks maybe a bit off, so there could be an issue…”</p>
      </div>
      <p className="eyebrow mb-2 !text-xs text-ivory/90">A FoodVision AI finding ↓</p>
      <article className="relative bg-ivory text-char shadow-[10px_10px_0_rgba(35,26,24,.4)]">
        <header className="flex items-center justify-between bg-char px-4 py-2 text-ivory">
          <span className="eyebrow !text-sm">Finding · FV-0142</span>
          <span className="bg-amber px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">Review required</span>
        </header>
        <div className="relative aspect-[16/6] overflow-hidden bg-sand">
          <svg viewBox="0 0 320 120" className="h-full w-full" aria-hidden="true">
            {[70, 160, 250].map((x) => (<g key={x}><rect x={x - 32} y="22" width="64" height="80" rx="8" fill="#fff" stroke="#231a18" strokeWidth="2" /><rect x={x - 32} y="56" width="64" height="24" fill="#7a1f2b" /></g>))}
            <rect x="118" y="16" width="84" height="92" fill="none" stroke="#b8324a" strokeWidth="3" strokeDasharray="7 4" className="flow-dash" />
          </svg>
          <div className="scanline !h-[2px]" />
        </div>
        <dl className="px-4 py-2">
          <Row k="Finding" v={<b>Seal irregularity</b>} />
          <Row k="Category" v="Packaging" />
          <Row k="Severity" v={<span className="bg-rose/15 px-2 py-0.5 text-xs font-extrabold uppercase text-burgundy">High</span>} />
          <Row k="Confidence" v={<span className="flex items-center gap-2"><span className="h-2 w-28 bg-char/15"><span className="block h-full w-[82%] bg-burgundy" /></span>82%</span>} />
          <Row k="Observed" v="Visible gap along the lid edge on the centre unit." />
          <Row k="Interpretation" v={<span className="text-char/75">Possible sealing fault. Not confirmed.</span>} />
          <Row k="Next action" v="Re-inspect lot; check sealing station." />
          <Row k="Limits" v={<span className="text-char/65">Image cannot show contamination; qualified review required.</span>} />
        </dl>
        <footer className="flex flex-wrap gap-2 border-t-2 border-char px-4 py-3">
          <span className="bg-sage px-3 py-1 text-xs font-bold text-white">Confirm</span>
          <span className="border border-char px-3 py-1 text-xs font-bold">Reject</span>
          <span className="border border-char px-3 py-1 text-xs font-bold">False positive</span>
        </footer>
      </article>
      <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-widest text-ivory/70">Illustrative · sample content, not customer data</p>
    </div>
  );
}
