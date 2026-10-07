/** Illustrative inspection scene: abstract product trays with detection frames. Not real data. */
export function HeroScene() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
      <div className="parallax absolute inset-0" style={{ ['--speed' as string]: 0.08 }}>
        <div className="absolute -right-4 top-6 h-24 w-24 rounded-full bg-rose floaty" style={{ ['--d' as string]: '0ms' }} />
        <div className="absolute -left-2 bottom-16 h-14 w-14 rounded-full bg-cream floaty" style={{ ['--d' as string]: '900ms' }} />
        <div className="absolute inset-4 overflow-hidden rounded-full bg-cream">
          <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Illustrative inspection of packaged products with detection frames">
            <rect width="400" height="400" fill="#e8dccb" />
            <g className="spin-slow" style={{ transformOrigin: '200px 200px' }} opacity=".35">
              <circle cx="200" cy="200" r="170" fill="none" stroke="#7a1f2b" strokeWidth="1.500" strokeDasharray="3 9" />
            </g>
            {[[110, 130], [250, 120], [140, 260], [280, 270]].map(([x, y], i) => (
              <g key={i}>
                <rect x={x - 45} y={y - 32} width="90" height="64" rx="10" fill={i % 2 ? '#fbf7f0' : '#fff'} stroke="#231a18" strokeWidth="2" />
                <rect x={x - 45} y={y - 10} width="90" height="22" fill="#7a1f2b" opacity=".85" />
                <circle cx={x + 22} cy={y - 20} r="5" fill="#231a18" opacity=".25" />
              </g>
            ))}
            <g fill="none" stroke="#4f7a5a" strokeWidth="2.500"><rect x="55" y="92" width="110" height="80" /></g>
            <g fill="none" stroke="#b8324a" strokeWidth="3"><rect x="195" y="82" width="110" height="80" strokeDasharray="8 5" className="flow-dash" /></g>
            <g fill="none" stroke="#b7791f" strokeWidth="2.500"><rect x="85" y="222" width="110" height="80" /></g>
          </svg>
          <div className="scanline" />
        </div>
      </div>
      <span className="floaty absolute left-0 top-[18%] bg-char px-3 py-1.5 text-sm font-bold text-ivory" style={{ ['--r' as string]: '-4deg', ['--d' as string]: '300ms' }}>Seal irregularity · review</span>
      <span className="floaty absolute right-0 top-[48%] bg-ivory px-3 py-1.5 text-sm font-bold text-burgundy shadow" style={{ ['--r' as string]: '3deg', ['--d' as string]: '1200ms' }}>Label text unclear</span>
      <span className="floaty absolute bottom-[8%] left-[18%] bg-sage px-3 py-1.5 text-sm font-bold text-white" style={{ ['--r' as string]: '-2deg', ['--d' as string]: '700ms' }}>Acceptable</span>
      <span className="absolute bottom-1 right-6 text-xs font-bold uppercase tracking-widest text-ivory/80">Illustrative</span>
    </div>
  );
}
