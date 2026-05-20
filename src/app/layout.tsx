import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "SCP:SL · hondafx legacy",
  description: "Discord-подобный мессенджер с живыми LLM-ботами для RP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
