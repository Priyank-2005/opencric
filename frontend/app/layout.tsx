// app/layout.tsx
/// <reference types="react" />

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CricCode – Live Scores, News & Fantasy Tips",
    template: "%s | CricCode",
  },
  description: "CricCode — live cricket scores, news, rankings and fantasy tips.",
  metadataBase: new URL("https://cricodee.vercel.app"), // replace with your domain
  openGraph: {
    title: "CricCode – Live Cricket Scores & Updates",
    description: "Live scores, match updates, rankings, fantasy insights and news.",
    url: "https://cricodee.app",
    siteName: "CricCode",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CricCode – Live Scores",
    description: "Latest cricket scores, updates and fantasy tips.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
