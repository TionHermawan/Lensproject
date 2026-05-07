import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Menuju Temu Sastra: Lentera Puisi 2026",
  description: "Medium publikasi antologi puisi, merayakan kata dalam keheningan.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans bg-bg text-text antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
