import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#1F7A5A",
};

export const metadata: Metadata = {
  title: {
    default: "Habitus | Build Back Home With Confidence",
    template: "%s | Habitus",
  },
  description: "Habitus helps Africans in the diaspora independently verify ongoing real estate construction projects back home through trusted inspections, photo evidence, video evidence, and structured reports.",
  keywords: [
    "Habitus",
    "diaspora real estate",
    "Africa property inspection",
    "Nigeria home inspection",
    "construction verification",
    "building inspection",
    "property monitoring",
    "diaspora home building",
    "independent site inspection",
    "trust infrastructure"
  ],
  openGraph: {
    title: "Habitus | Build Back Home With Confidence",
    description: "Independent verification for your building projects back home. Request inspections, receive structured reports, and know exactly what is happening on your project.",
    siteName: "Habitus",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habitus | Build Back Home With Confidence",
    description: "Know exactly what is happening on your building project back home.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
