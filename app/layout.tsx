import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PRODUCT_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-canvas text-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
