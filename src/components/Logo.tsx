export function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="3" />
      <path d="M8 24c4.5-7.5 10-11 16-11s11.5 3.5 16 11c-4.5 7.5-10 11-16 11S12.500 31.500 8 24Z" fill="currentColor" />
      <circle cx="24" cy="24" r="5.500" fill="var(--logo-pupil, #f6efe4)" />
      <path d="M24 1.500v5M24 41.500v5M1.500 24h5M41.500 24h5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} style={{ ['--logo-pupil' as string]: light ? '#7a1f2b' : '#f6efe4' }}>
      <LogoMark />
      <span className="display text-[1.55rem] leading-none tracking-wide">
        FoodVision<span className="opacity-70"> AI</span>
      </span>
    </span>
  );
}
