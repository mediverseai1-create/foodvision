import type { Metadata } from 'next';
import { Barlow_Condensed, Manrope } from 'next/font/google';
import './globals.css';

const display = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display' });
const body = Manrope({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://foodvisionai.cloud'),
  title: { default: 'FoodVision AI — AI Food Quality & Operations Intelligence', template: '%s · FoodVision AI' },
  description: 'FoodVision AI combines computer vision with production, batch, supplier and quality data to turn inspections into operational intelligence, investigations and prioritized action.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
