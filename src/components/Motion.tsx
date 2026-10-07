'use client';
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

/** Scroll-triggered slide/fade. Respects reduced motion via CSS. */
export function Reveal({ children, from = 'up', delay = 0, className = '', as: Tag = 'div' }: {
  children: ReactNode; from?: 'up' | 'left' | 'right' | 'pop'; delay?: number; className?: string; as?: 'div' | 'li' | 'section' | 'span';
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect(); } }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const dir = { up: '', left: 'reveal-left', right: 'reveal-right', pop: 'reveal-pop' }[from];
  const T = Tag as 'div';
  return (
    <T ref={ref as React.RefObject<HTMLDivElement>} data-in={inView} className={`reveal ${dir} ${className}`} style={{ ['--d' as string]: `${delay}ms` } as CSSProperties}>
      {children}
    </T>
  );
}

/** Writes scroll position to a CSS variable so children can parallax with .parallax + --speed. */
export function ParallaxRoot({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => ref.current?.style.setProperty('--sy', String(Math.min(window.scrollY, 900)))); };
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

/** Headline whose lines slide up one after another. */
export function SlideLines({ lines, className = '', start = 100 }: { lines: string[]; className?: string; start?: number }) {
  return (
    <h1 className={className}>
      {lines.map((l, i) => (
        <span key={l} className="slide-line"><span style={{ ['--d' as string]: `${start + i * 130}ms` } as CSSProperties}>{l}</span></span>
      ))}
    </h1>
  );
}

/** Counts up once visible. Used only for values that are real (e.g. fixed product facts), never fabricated metrics. */
export function Marquee({ items }: { items: { label: string; color: string; icon: ReactNode }[] }) {
  const row = [...items, ...items];
  return (
    <div className="marquee overflow-hidden" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center gap-12 pr-12">
            {row.map((it, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full" style={{ background: it.color }}>{it.icon}</span>
                <span className="display text-3xl whitespace-nowrap text-white">{it.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
