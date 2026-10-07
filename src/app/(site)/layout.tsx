import { SiteHeader, SiteFooter } from '@/components/SiteChrome';
import { ParallaxRoot } from '@/components/Motion';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ParallaxRoot>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </ParallaxRoot>
  );
}
