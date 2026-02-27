import type { Metadata, Viewport } from "next";
import "./globals.css";

// 🎨 visual
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

// 🪄  SEO
export const metadata: Metadata = {
  title: "MicroGames | Train Your Brain",
  description: "A collection of 15 fast-paced micro-games to train your memory, attention, and reaction speed. Play for free!",
  keywords: ["brain training", "micro games", "memory match", "schulte table", "simon says", "reaction games", "cognitive training"],
  authors: [{ name: "Awesome Developer" }],
  openGraph: {
    title: "MicroGames | Brain Training",
    description: "Challenge your brain with 15 fast-paced micro-games!",
    siteName: "MicroGames",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
        {children}
      </body>
    </html>
  );
}