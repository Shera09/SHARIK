import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { CommandPaletteProvider } from '@/components/command-palette-provider';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'WebHoster - AI-Powered Business Operating System for India',
    template: '%s | WebHoster',
  },
  description: 'Run your entire business with one AI-powered platform. GST-compliant invoicing, 20+ AI agents, automated workflows, customer portal, and business intelligence. Built for Indian businesses.',
  keywords: ['business software', 'GST invoicing', 'AI automation', 'Indian business', 'CRM', 'invoice software', 'business intelligence', 'customer management', 'lead management'],
  authors: [{ name: 'WebHoster Team' }],
  creator: 'WebHoster',
  publisher: 'WebHoster',
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL('https://webhoster.io'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://webhoster.io',
    siteName: 'WebHoster',
    title: 'WebHoster - AI-Powered Business Operating System for India',
    description: 'Run your entire business with one AI-powered platform. GST-compliant invoicing, 20+ AI agents, automated workflows, and business intelligence.',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'WebHoster - AI Business Platform' },
      { url: '/og-image-square.png', width: 600, height: 600, alt: 'WebHoster Logo' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebHoster - AI-Powered Business OS',
    description: 'Run your entire business with one AI-powered platform. GST invoicing, AI agents, automation.',
    images: ['/og-image.png'],
    creator: '@webhoster_io',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
    apple: [{ url: '/apple-icon.png' }],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'WebHoster',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '999',
      priceCurrency: 'INR',
      priceValidUntil: '2025-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description: 'AI-powered business operating system for Indian businesses with GST-compliant invoicing, automation, and business intelligence.',
    url: 'https://webhoster.io',
    logo: 'https://webhoster.io/logo.png',
    sameAs: [
      'https://twitter.com/webhoster_io',
      'https://www.linkedin.com/company/webhoster',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} ${display.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster richColors position="top-right" />
          <CommandPaletteProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
