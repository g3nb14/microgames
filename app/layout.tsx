import type { Metadata } from "next";
import "./globals.css";

//  SEO 🪄
export const metadata: Metadata = {
  title: "MicroGames | Train Your Brain",
  description: "A collection of 12 fast-paced micro-games to train your memory, attention, and reaction speed. Play for free!",
  keywords: ["brain training", "micro games", "memory match", "schulte table", "simon says", "reaction games", "cognitive training"],
  authors: [{ name: "Awesome Developer" }], // Можешь вписать свое имя 😉

  // Open Graph for Telegram, WhatsApp, Discord и Twitter
  openGraph: {
    title: "MicroGames | Brain Training",
    description: "Challenge your brain with 12 fast-paced micro-games!",
    siteName: "MicroGames",
    locale: "en_US",
    type: "website",
  },

  // mobile
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Наши классы для плавной темной темы сохранены! */}
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
        {children}
      </body>
    </html>
  );
}