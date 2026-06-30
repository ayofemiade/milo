import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MILO® Cinematic Experience - Unlock Your Active Vitality",
  description: "Experience the awakening of raw cocoa, energy-packed malt, and vibrant Milo green energy. Scroll to control the cinematic visual journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#020803] text-[#f4f7f5] overflow-x-hidden selection:bg-[#009639] selection:text-white">
        {children}
      </body>
    </html>
  );
}
