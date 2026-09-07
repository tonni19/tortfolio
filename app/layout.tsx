import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Grain from "@/components/Grain";
import MuteGuard from "@/components/MuteGuard";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tortilla.art"),
  title: {
    default: "Tortilla — 2D Digital Artist & Illustrator",
    template: "%s — Tortilla",
  },
  description:
    "Character design, asset production, illustration and sequential art by Tortilla, a 2D digital artist in Dhaka. Commissions open.",
  keywords: [
    "2D digital artist",
    "illustrator",
    "character design",
    "asset production",
    "comic art",
    "pixel art",
    "frame by frame animation",
  ],
  authors: [{ name: "Tortilla" }],
  openGraph: {
    type: "website",
    siteName: "Tortilla",
    title: "Tortilla — 2D Digital Artist & Illustrator",
    description:
      "Character design, illustration and sequential art. Characters that refuse to sit still.",
    images: [
      { url: "/art/wallpaper/final111.webp", width: 1800, height: 1800, alt: "Tortilla" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tortilla — 2D Digital Artist & Illustrator",
    description: "Character design, illustration and sequential art.",
    images: ["/art/wallpaper/final111.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e7",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${anton.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
    >
      {/* Browser extensions (Grammarly and friends) inject attributes onto
          <body> before React hydrates, which reads as a mismatch. */}
      <body suppressHydrationWarning>
        <Grain />
        <Nav />
        <MuteGuard />
        {children}
      </body>
    </html>
  );
}
