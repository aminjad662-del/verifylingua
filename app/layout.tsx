import type { Metadata } from "next";
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
      <body className={`${basierSquare.variable} ${sanFrancisco.variable} min-h-screen bg-canvas text-ink-soft antialiased`}>
        {children}
      </body>
    </html>
  );
}
