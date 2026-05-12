import type { Metadata } from 'next';
import { Newsreader, Outfit } from 'next/font/google';
import { getClinic } from '@/lib/data';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300','400','500','600','700','800'],
  variable: '--font-outfit',
  display: 'swap',
});
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  style: ['normal','italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const clinic = await getClinic();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${clinic.name} — ${clinic.tagline}`, template: `%s · ${clinic.name}` },
    description: clinic.hero_body,
    applicationName: clinic.name,
    keywords: [
      clinic.name, 'family medicine', 'physiotherapy', 'clinic',
      'Mineville', 'Nova Scotia', 'doctor', 'general practitioner',
    ],
    openGraph: {
      type: 'website',
      siteName: clinic.name,
      title: `${clinic.name} — ${clinic.tagline}`,
      description: clinic.hero_body,
      url: SITE_URL,
    },
    twitter: { card: 'summary_large_image', title: clinic.name, description: clinic.tagline },
    robots: { index: true, follow: true },
    alternates: { canonical: SITE_URL },
    icons: { icon: '/favicon.ico' },
  };
}

export const viewport = {
  width: 'device-width', initialScale: 1,
  themeColor: '#1B3829',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${newsreader.variable}`}>
      <head>
        {/* Mark JS-ready before paint so .reveal items only hide when JS will run */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js-ready')",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
