import "./globals.css";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeLayout } from "@/components/layout/theme-layout";
import { Toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";
import Script from "next/script";

// Import TypingSound component with dynamic import to avoid SSR issues
const TypingSound = dynamic(() => import("@/components/typing-sound"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CheetahType | A Modern & Customizable Typing Test",
  description:
    "Boost typing speed & accuracy with CheetahType – modern, customizable, multiplayer test with stats. A sleek alternative to monkeytype. Try Cheetah Type now!",
  metadataBase: new URL("https://cheetahtype.com"),
  keywords:
    "cheetahtype, cheetah type, typing test, wpm test, typing speed, typing practice, online typing, typing games, keyboard typing, touch typing, monkeytype",
  authors: [{ name: "CheetahType Team" }],
  creator: "CheetahType",
  publisher: "CheetahType",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/favicon.ico", sizes: "any" },
      { url: "/images/CheetahType.png", type: "image/png" },
    ],
    shortcut: "/images/favicon.ico",
    apple: "/images/apple-icon.png",
  },
  openGraph: {
    title: "CheetahType | A Modern & Customizable Typing Test",
    description:
      "Boost typing speed & accuracy with CheetahType – modern, customizable, multiplayer test with stats. A sleek alternative to monkeytype.com.",
    url: "https://cheetahtype.com",
    siteName: "CheetahType",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CheetahType | A Modern & Customizable Typing Test",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CheetahType | A Modern & Customizable Typing Test",
    description:
      "Boost typing speed & accuracy with CheetahType – modern, customizable, multiplayer test with stats. A sleek alternative to monkeytype.com.",
    images: ["/images/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://cheetahtype.com",
  },
  manifest: "/manifest.json",
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
        <link rel="author" href="/humans.txt" />
        <link rel="help" href="/.well-known/security.txt" />
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/CheetahType.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/apple-icon.png" />
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="sitemap" href="/sitemap-index.xml" />

        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-TVXJGS0S5X"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TVXJGS0S5X');
          `}
        </Script>
        {/* End Google Analytics */}

      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <ThemeLayout>
              {children}
              <Toaster />
              <TypingSound />
            </ThemeLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}