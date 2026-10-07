import fs from 'node:fs';
import path from 'node:path';

/** Large circular hero image. If /public/hero.jpg (or .webp/.png) exists it is used; otherwise an illustrated
 *  inspection-line scene is shown. Detection tags are illustrative. */
function heroPhoto() {
  for (const f of ['hero.jpg', 'hero.webp', 'hero.png']) if (fs.existsSync(path.join(process.cwd(), 'public', f))) return `/${f}`;
  return null;
}

export function HeroScene() {
  const photo = heroPhoto();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[640px]">
      <div className="parallax absolute inset-0" style={{ ['--speed' as string]: 0.08 }}>
        {/* decorative circles */}
        <div className="absolute -right-2 top-2 h-28 w-28 rounded-full bg-rose floaty" />
        <div className="absolute -left-4 bottom-20 h-16 w-16 rounded-full bg-cream floaty" style={{ ['--d' as string]: '900ms' }} />
        <div className="absolute right-10 bottom-0 h-12 w-12 rounded-full bg-amber floaty" style={{ ['--d' as string]: '1600ms' }} />
        <div className="absolute inset-3 overflow-hidden rounded-full border-[6px] border-ivory bg-cream shadow-[10px_10px_0_rgba(35,26,24,.35)]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="Food quality inspection" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="Illustrative inspection line with detected packaged products">
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3e7d3" /><stop offset="1" stopColor="#e2d1b8" /></linearGradient>
                <pattern id="belt" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#3a2d2a" /><rect width="12" height="24" fill="#2e2321" /></pattern>
              </defs>
              <rect width="400" height="400" fill="url(#bg)" />
              {/* overhead camera rig */}
              <rect x="150" y="0" width="100" height="26" fill="#231a18" /><rect x="190" y="26" width="20" height="26" fill="#231a18" />
              <circle cx="200" cy="64" r="16" fill="#231a18" /><circle cx="200" cy="64" r="8" fill="#b8324a" />
              <path d="M200 80 L110 300 H290 Z" fill="#f6efe4" opacity=".28" />
              {/* conveyor */}
              <rect x="0" y="290" width="400" height="70" fill="url(#belt)" className="flow-dash" />
              <rect x="0" y="284" width="400" height="8" fill="#231a18" />
              {/* products: jar, box, bottle, tray */}
              <g>
                <rect x="40" y="210" width="62" height="76" rx="8" fill="#fff" stroke="#231a18" strokeWidth="3" /><rect x="36" y="198" width="70" height="16" rx="4" fill="#231a18" />
                <rect x="40" y="236" width="62" height="26" fill="#7a1f2b" /><circle cx="71" cy="249" r="6" fill="#f6efe4" />
              </g>
              <g>
                <rect x="140" y="196" width="84" height="90" fill="#f6efe4" stroke="#231a18" strokeWidth="3" /><path d="M140 196l12-14h60l12 14" fill="#e8dccb" stroke="#231a18" strokeWidth="3" />
                <rect x="152" y="220" width="60" height="34" fill="#b8324a" /><path d="M170 150l12 30-10 20" stroke="#231a18" strokeWidth="3" fill="none" />
              </g>
              <g>
                <rect x="262" y="192" width="40" height="94" rx="14" fill="#4f7a5a" stroke="#231a18" strokeWidth="3" /><rect x="272" y="170" width="20" height="28" fill="#231a18" />
                <rect x="262" y="222" width="40" height="30" fill="#f6efe4" />
              </g>
              <g><rect x="326" y="236" width="62" height="50" rx="6" fill="#fff" stroke="#231a18" strokeWidth="3" /><circle cx="344" cy="258" r="9" fill="#b7791f" /><circle cx="368" cy="258" r="9" fill="#b8324a" /></g>
              {/* detection frames */}
              <rect x="28" y="188" width="86" height="106" fill="none" stroke="#4f7a5a" strokeWidth="3.5" />
              <rect x="130" y="142" width="104" height="152" fill="none" stroke="#b8324a" strokeWidth="4" strokeDasharray="9 5" className="flow-dash" />
              <rect x="254" y="164" width="56" height="130" fill="none" stroke="#4f7a5a" strokeWidth="3.5" />
              <rect x="318" y="228" width="78" height="66" fill="none" stroke="#b7791f" strokeWidth="3.5" />
            </svg>
          )}
          <div className="scanline" />
        </div>
      </div>
      <span className="floaty absolute left-0 top-[16%] bg-char px-3 py-1.5 text-sm font-bold text-ivory" style={{ ['--r' as string]: '-4deg', ['--d' as string]: '300ms' }}>Packaging · seal irregularity</span>
      <span className="floaty absolute right-0 top-[44%] bg-ivory px-3 py-1.5 text-sm font-bold text-burgundy shadow" style={{ ['--r' as string]: '3deg', ['--d' as string]: '1200ms' }}>Label · text unclear</span>
      <span className="floaty absolute bottom-[10%] left-[10%] bg-sage px-3 py-1.5 text-sm font-bold text-white" style={{ ['--r' as string]: '-2deg', ['--d' as string]: '700ms' }}>Acceptable</span>
      <span className="floaty absolute right-[6%] top-[6%] bg-amber px-3 py-1.5 text-sm font-bold text-white" style={{ ['--r' as string]: '5deg', ['--d' as string]: '1700ms' }}>Batch A-1042 · review</span>
      <span className="absolute -bottom-6 right-6 text-xs font-bold uppercase tracking-widest text-ivory/80">Illustrative</span>
    </div>
  );
}
