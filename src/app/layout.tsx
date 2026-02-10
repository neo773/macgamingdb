import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { TRPCProvider } from '@/lib/trpc/provider';
import { Toaster } from '@/components/ui/sonner';
import Script from 'next/script';
import { BackgroundGradient } from '@/modules/layout/components/BackgroundGradient';
import './tailwind.css';

const GeistMono = Geist({ subsets: ['latin'], weight: ['400', '500'] });

export const metadata: Metadata = {
  title: 'MacGamingDB | Apple Silicon Mac Games – Compatibility & Benchmarks',
  description:
    'Mac compatible games list with Apple Silicon benchmarks for M1–M4. Check FPS via Rosetta, CrossOver, Parallels & GPTK.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta
        name="google-site-verification"
        content="ZHuErRXhH2hBeyHfh9ieBXRVc6W19dktrLaCK-_dmDc"
      />
      <meta name="google-adsense-account" content="ca-pub-4009451848051361" />
      <body className={`${GeistMono.className} dark`}>
        <BackgroundGradient />
        <TRPCProvider>{children}</TRPCProvider>
        <Toaster />
      </body>
      {/* <!-- Cloudflare Web Analytics --> */}
      <Script
        defer
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon='{"token": "063dd3764d5a4005a9d6807bd95fc60b"}'
      />
      {/* <!-- End Cloudflare Web Analytics --> */}
      {/* <!-- Umami Web Analytics --> */}
      <Script
        defer
        src="https://dlso-ap96.macgamingdb.app/app.js"
        data-website-id="b4003a2d-153d-492c-bf43-0150ba704213"
      />
      {/* <!-- End Umami Web Analytics --> */}
    </html>
  );
}
