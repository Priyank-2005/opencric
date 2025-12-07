// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CricCode – Live Scores, News, Stats & Fantasy Tips",
    template: "%s | CricCode"
  },
  description:
    "CricCode brings you live cricket scores, match updates, rankings, news, fantasy tips, and detailed stats.",
  keywords: ["cricket", "live scores", "CricCode", "fantasy cricket", "rankings", "cricket news"],
  authors: [{ name: "CricCode Team" }],
  creator: "CricCode",
  metadataBase: new URL("https://opencric-qcxaz2oq4-priyanks-projects-35007afa.vercel.app/"),

  openGraph: {
    title: "CricCode – Live Cricket Scores & Updates",
    description:
      "Get real-time updates, live scores, rankings, fantasy insights, and the latest cricket news.",
    url: "https://opencric-qcxaz2oq4-priyanks-projects-35007afa.vercel.app/",
    siteName: "CricCode",
    images: [
      {
        url: "/og-image.png", // Place file inside /public
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CricCode – Live Cricket Scores",
    description: "Latest cricket scores, updates, stats, and news.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};
