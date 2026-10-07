'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './Logo';

const NAV = [
  { href: '/ai-inspection', label: 'AI Inspection' },
  { href: '/quality-intelligence', label: 'Intelligence' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-sand bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" aria-label="FoodVision AI home" className="text-burgundy"><Logo /></Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="display text-xl tracking-wide transition-colors hover:text-burgundy">{n.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <Link href="/sign-in" className="display text-xl hover:text-burgundy">Sign in</Link>
          <Link href="/sign-up" className="btn btn-dark !py-2">Get started</Link>
        </div>
        <button className="md:hidden p-2" aria-expanded={open} aria-controls="mnav" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span className="block h-0.5 w-6 bg-char mb-1.5" /><span className="block h-0.5 w-6 bg-char mb-1.5" /><span className="block h-0.5 w-6 bg-char" />
        </button>
      </div>
      {open && (
        <nav id="mnav" aria-label="Mobile" className="flex flex-col gap-4 border-t border-sand bg-ivory px-5 py-5 md:hidden">
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="display text-3xl">{n.label}</Link>)}
          <Link href="/sign-in" className="display text-3xl">Sign in</Link>
          <Link href="/sign-up" className="btn btn-dark self-start">Get started</Link>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const cols = [
    { h: 'Product', l: [['/ai-inspection', 'AI Inspection'], ['/quality-intelligence', 'Quality Intelligence'], ['/food-safety', 'Food Safety'], ['/supplier-intelligence', 'Supplier Intelligence'], ['/incident-intelligence', 'Incident Intelligence']] },
    { h: 'Company', l: [['/features', 'Features'], ['/how-it-works', 'How it works'], ['/pricing', 'Pricing'], ['/about', 'About'], ['/contact', 'Contact']] },
    { h: 'Legal', l: [['/security', 'Security'], ['/privacy', 'Privacy'], ['/terms', 'Terms']] },
  ];
  return (
    <footer className="bg-char text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div>
          <Logo light className="text-ivory" />
          <p className="mt-4 max-w-xs text-sm text-ivory/70">AI food quality &amp; operations intelligence. FoodVision AI supports qualified professionals; it is not a laboratory or regulatory instrument.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h2 className="eyebrow text-rose">{c.h}</h2>
            <ul className="mt-3 space-y-2 text-sm">{c.l.map(([h, t]) => <li key={h}><Link href={h} className="text-ivory/80 hover:text-white">{t}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ivory/50">© {new Date().getFullYear()} FoodVision AI · foodvisionai.cloud</div>
    </footer>
  );
}
