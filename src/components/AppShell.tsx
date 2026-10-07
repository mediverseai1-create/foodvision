'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './Logo';

const NAV: [string, string][] = [
  ['/app', 'Overview'], ['/app/inspections', 'Inspections'], ['/app/products', 'Products'], ['/app/batches', 'Batches / Lots'],
  ['/app/lines', 'Production'], ['/app/suppliers', 'Suppliers'], ['/app/quality', 'Quality Intelligence'], ['/app/food-safety', 'Food Safety'],
  ['/app/haccp', 'HACCP'], ['/app/incidents', 'Incidents'], ['/app/recall', 'Recall Intelligence'], ['/app/actions', 'Actions'],
  ['/app/reports', 'Reports'], ['/app/assistant', 'AI Assistant'], ['/app/agents', 'AI Agents'], ['/app/team', 'Team'],
  ['/app/activity', 'Activity'], ['/app/usage', 'Usage / Billing'], ['/app/settings', 'Settings'],
];

export function AppShell({ children, orgName, roleLabel, email, lowCredits, signOut }: { children: React.ReactNode; orgName: string; roleLabel: string; email: string; lowCredits: boolean; signOut: () => Promise<void> }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Application" className="flex flex-col py-2">
      {NAV.map(([href, label]) => {
        const active = href === '/app' ? path === '/app' : path.startsWith(href);
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined}
            className={`display border-l-4 px-5 py-1.5 text-[1.15rem] tracking-wide transition-all ${active ? 'border-rose bg-white/10 text-white' : 'border-transparent text-ivory/70 hover:border-white/40 hover:pl-6 hover:text-white'}`}>
            {label}{href === '/app/usage' && lowCredits && <span className="ml-2 rounded-full bg-amber px-1.5 text-xs">low</span>}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
      <header className="flex items-center justify-between bg-char px-4 py-3 text-ivory md:hidden">
        <Logo light />
        <button aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)} className="display text-xl">{open ? 'Close' : 'Menu'}</button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} max-h-[80vh] overflow-y-auto bg-char text-ivory md:sticky md:top-0 md:block md:h-screen md:max-h-none`}>
        <div className="hidden px-5 pb-3 pt-5 md:block"><Link href="/app"><Logo light /></Link></div>
        <div className="border-y border-white/10 px-5 py-3 text-sm"><p className="font-bold">{orgName}</p><p className="text-ivory/60">{roleLabel}</p></div>
        {nav}
        <form action={signOut} className="border-t border-white/10 p-5 text-sm"><p className="mb-2 truncate text-ivory/60">{email}</p><button className="display text-lg text-rose hover:text-white">Sign out</button></form>
      </aside>
      <main id="content" className="min-w-0 bg-ivory p-4 md:p-8">{children}</main>
    </div>
  );
}
