import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PRODUCT_NAME } from "@/lib/constants";

/* Authentic Basier Square (atipo) font configuration */
const basierSquare = localFont({
  src: [
    {
      path: "../public/fonts/basier-square/BasierSquare-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/basier-square/BasierSquare-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/basier-square/BasierSquare-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/basier-square/BasierSquare-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-basier-square",
  display: "swap",
});

/* Authentic Apple San Francisco (SF Pro) font configuration */
const sanFrancisco = localFont({
  src: [
    {
      path: "../public/fonts/san-francisco/SFProDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/san-francisco/SFProDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/san-francisco/SFProDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/san-francisco/SFProDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-san-francisco",
  display: "swap",
});

import { THEME_COLOR_LIGHT, THEME_COLOR_DARK } from "@/lib/theme-constants";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR_DARK },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: `${PRODUCT_NAME} | Certified Translation Services for USCIS, Courts & Universities`,
  description:
    "Guaranteed certified document translations for USCIS, universities, courts, and consulates. Fast 24h turnaround, instant AI triage, and public verification portal.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${basierSquare.variable} ${sanFrancisco.variable}`} suppressHydrationWarning>
      <head>
        {/* Non-blocking Google Fonts — preconnect first, then stylesheet link.
            Using <link> instead of CSS @import avoids render-blocking on Cloudflare edge. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Instrument+Serif:ital@0;1&display=swap"
        />
        {/* Zero-flicker theme initializer */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${basierSquare.variable} ${sanFrancisco.variable} min-h-screen bg-canvas text-ink-soft antialiased`}>
        {children}
      </body>
    </html>
  );
}
