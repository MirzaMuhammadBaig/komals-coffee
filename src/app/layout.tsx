import type { Metadata } from "next";
import { Inter, Playfair_Display, Dancing_Script } from "next/font/google";
import { site } from "@/lib/data/site";
import CleanPreviewUrl from "@/components/CleanPreviewUrl";
import ClickEffect from "@/components/ClickEffect";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.shortDescription,
  keywords: [
    "Komal's Coffee",
    "Bahria Orchard coffee",
    "Lahore home coffee",
    "specialty coffee Lahore",
    "caramel latte Lahore",
    "home-based coffee Pakistan",
    "Komals Coffee",
    "Komal Hassan coffee",
  ],
  openGraph: {
    title: `${site.name} · ${site.tagline}`,
    description: site.shortDescription,
    type: "website",
    locale: "en_PK",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.tagline}`,
    description: site.shortDescription,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${dancing.variable}`}
    >
      <body className="min-h-screen bg-cream-50 font-sans text-espresso-800 antialiased">
        <CleanPreviewUrl />
        {children}
        <ClickEffect />
      </body>
    </html>
  );
}
