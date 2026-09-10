import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://macauive.dev/'),
  alternates: {
    canonical: '/'
  },
  title: {
    default: 'Iver Macaulay - AI Engineer',
    template: '%s | Iver Macaulay'
  },
  openGraph: { type: 'website', siteName: 'Iver Macaulay', images: ['/images/og/home.jpg'] },
  twitter: { card: 'summary_large_image' },
  description: 'AI engineer building practical automation, transcription, lead scoring, data pipelines, and operational systems',
};

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} bg-[#101111] antialiased text-zinc-100`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="min-h-screen w-full bg-[#101111]">
            <div className="relative min-h-screen w-full">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
