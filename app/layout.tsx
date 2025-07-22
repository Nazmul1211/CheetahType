import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeLayout } from '@/components/layout/theme-layout';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: 'CheetahType - A Modern Typing Test',
  description: 'Improve your typing speed and accuracy with CheetahType - a free, modern typing test application with multiple test modes, statistics, and multiplayer features.',
  metadataBase: new URL('https://cheetahtype.com'),
  keywords: 'typing test, wpm test, typing speed, typing practice, online typing, typing games, keyboard typing, touch typing',
  authors: [{ name: 'CheetahType Team' }],
  creator: 'CheetahType',
  publisher: 'CheetahType',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/images/apple-icon.png',
  },
  openGraph: {
    title: 'CheetahType - A Modern Typing Test',
    description: 'Improve your typing speed and accuracy with CheetahType - a free, modern typing test application.',
    url: 'https://cheetahtype.com',
    siteName: 'CheetahType',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CheetahType - A Modern Typing Test',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CheetahType - A Modern Typing Test',
    description: 'Improve your typing speed and accuracy with CheetahType',
    images: ['/images/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://cheetahtype.com',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#14b8a6" />
        <link rel="canonical" href="https://cheetahtype.com" />
        <link rel="author" href="/humans.txt" />
        <link rel="help" href="/.well-known/security.txt" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <ThemeLayout>
              {children}
              <Toaster />
            </ThemeLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
