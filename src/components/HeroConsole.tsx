/** Illustrative product console showing See → Understand → Investigate → Act. Sample content only, labelled as such. */
const Tag = ({ children, tone }: { children: React.ReactNode; tone: string }) => (
  <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${tone}`}>{children}</span>
);
const Step = ({ n, label }: { n: string; label: string }) => (
  <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-burgundy"><span className="grid h-5 w-5 place-items-center bg-burgundy text-[10px] text-ivory">{n}</span>{label}</p>
);

export function HeroConsole() {
  const bars = [2, 3, 2, 4, 3, 3, 2, 3, 4, 7, 9];
  return (
    <div className="relative mx-auto w-full max-w-[600px]" aria-label="Illustrative FoodVision AI workflow">
      {/* connectors (desktop) */}
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 600 640" fill="none" aria-hidden="true">
        <path d="M300 250 C 300 290, 160 280, 150 330" stroke="#f6efe4" strokeOpacity=".7" strokeWidth="2" className="flow-dash" />
        <path d="M330 250 C 400 290, 450 300, 450 350" stroke="#f6efe4" strokeOpacity=".7" strokeWidth="2" className="flow-dash" />
        <path d="M150 470 C 150 520, 280 500, 300 540" stroke="#f6efe4" strokeOpacity=".7" strokeWidth="2" className="flow-dash" />
        <path d="M450 480 C 450 520, 340 510, 320 540" stroke="#f6efe4" strokeOpacity=".7" strokeWidth="2" className="flow-dash" />
      </svg>

      <div className="relative grid gap-4 lg:block lg:h-[640px]">
        {/* 1 SEE */}
        <div className="bg-ivory p-4 text-char shadow-[8px_8px_0_rgba(35,26,24,.35)] lg:absolute lg:left-[14%] lg:top-0 lg:w-[72%] floaty" style={{ ['--d' as string]: '0ms' }}>
          <Step n="1" label="See · AI visual inspection" />
          <div className="relative aspect-[16/8] overflow-hidden bg-sand">
            <svg viewBox="0 0 320 160" className="h-full w-full" role="img" aria-label="Illustrative packaged products with detection frames">
              {[60, 160, 260].map((x, i) => (
                <g key={x}><rect x={x - 38} y="38" width="76" height="84" rx="8" fill="#fff" stroke="#231a18" strokeWidth="2" /><rect x={x - 38} y="68" width="76" height="26" fill="#7a1f2b" /><circle cx={x} cy="52" r="6" fill="#231a18" opacity=".2" />{i === 1 && <path d="M150 40l10 14-8 12" stroke="#231a18" strokeWidth="2" fill="none" />}</g>
              ))}
              <rect x="116" y="30" width="88" height="100" fill="none" stroke="#b8324a" strokeWidth="3" strokeDasharray="7 4" className="flow-dash" />
              <rect x="16" y="30" width="88" height="100" fill="none" stroke="#4f7a5a" strokeWidth="2.5" />
            </svg>
            <div className="scanline !h-[2px]" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <Tag tone="bg-rose/15 text-burgundy">Packaging · seal irregularity</Tag><Tag tone="bg-amber/20 text-amber">Review required</Tag><Tag tone="bg-sage-soft text-sage">Label legible</Tag>
            <span className="text-char/60">Evidence ≠ interpretation</span>
          </div>
        </div>

        {/* 2 UNDERSTAND */}
        <div className="bg-cream p-4 text-char shadow-[8px_8px_0_rgba(35,26,24,.35)] lg:absolute lg:left-0 lg:top-[300px] lg:w-[46%] floaty" style={{ ['--d' as string]: '900ms' }}>
          <Step n="2" label="Understand · pattern" />
          <div className="flex h-16 items-end gap-1" role="img" aria-label="Illustrative weekly defect counts rising in the latest weeks">
            {bars.map((b, i) => <span key={i} className={`flex-1 ${i > 8 ? 'bg-burgundy' : 'bg-char/30'}`} style={{ height: `${b * 10}%` }} />)}
          </div>
          <p className="mt-2 text-xs font-bold">Findings rising on Line B</p>
          <p className="text-[11px] text-char/65">Associated with a supplier lot · requires investigation</p>
        </div>

        {/* 3 INVESTIGATE */}
        <div className="bg-char p-4 text-ivory shadow-[8px_8px_0_rgba(246,239,228,.25)] lg:absolute lg:right-0 lg:top-[330px] lg:w-[46%] floaty" style={{ ['--d' as string]: '1700ms' }}>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-rose"><span className="grid h-5 w-5 place-items-center bg-rose text-[10px] text-white">3</span>Investigate · batches</p>
          <ul className="space-y-1.5 text-xs">
            {[['Lot A-1042', 'in scope'], ['Lot A-1043', 'in scope'], ['Lot A-0991', 'review']].map(([l, s]) => <li key={l} className="flex justify-between border-b border-white/15 pb-1"><span>{l}</span><span className="text-ivory/60">{s}</span></li>)}
          </ul>
          <p className="mt-2 text-[11px] text-ivory/60">Scope for human review; no recall decision made by AI.</p>
        </div>

        {/* 4 ACT */}
        <div className="bg-sage p-4 text-white shadow-[8px_8px_0_rgba(35,26,24,.35)] lg:absolute lg:bottom-0 lg:left-[16%] lg:w-[68%] floaty" style={{ ['--d' as string]: '2400ms' }}>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest"><span className="grid h-5 w-5 place-items-center bg-white text-[10px] text-sage">4</span>Act · prioritized actions</p>
          <ul className="space-y-1 text-xs">
            <li className="flex justify-between"><span>Hold &amp; re-inspect Lot A-1042</span><b>HIGH</b></li>
            <li className="flex justify-between"><span>Open supplier corrective-action request</span><b>MED</b></li>
            <li className="flex justify-between"><span>Check Line B sealing station</span><b>MED</b></li>
          </ul>
        </div>
      </div>
      <p className="mt-4 text-center text-[11px] font-bold uppercase tracking-widest text-ivory/70 lg:mt-0 lg:absolute lg:-bottom-8 lg:left-0 lg:right-0">Illustrative · sample content, not customer data</p>
    </div>
  );
}
