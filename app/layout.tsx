import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://luomo.moe"),
  title: {
    default: "Luomo Cloud",
    template: "%s · Luomo Cloud",
  },
  description:
    "渡尽长夜，终见星辰。A dreamy cloud gateway drifting among stars, memories, and distant journeys.",
  keywords: ["Luomo", "cloud", "personal homepage", "cyber", "anime", "galgame", "star"],
  authors: [{ name: "luomo" }],
  creator: "luomo",
  openGraph: {
    title: "Luomo Cloud",
    description: "渡尽长夜，终见星辰。",
    url: "https://luomo.moe",
    siteName: "Luomo Cloud",
    images: [
      {
        url: "/assets/hero/hero-starry-control-room-generated.webp",
        width: 1200,
        height: 630,
        alt: "Luomo Cloud — cyber magic control room",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luomo Cloud",
    description: "渡尽长夜，终见星辰。",
    images: ["/assets/hero/hero-starry-control-room-generated.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#020617" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Luomo" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}