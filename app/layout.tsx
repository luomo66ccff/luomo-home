import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://luomo.moe"),
  title: {
    default: "Luomo / 洛墨 - 个人云服务与数字宇宙入口",
    template: "%s · Luomo",
  },
  description:
    "Luomo 是洛墨维护的个人数字空间，连接云服务、API、文件、运维、终端、开发项目与 Live2D 看板娘。",
  keywords: ["Luomo", "洛墨", "个人主页", "云服务", "API", "运维", "开发项目", "数字空间"],
  authors: [{ name: "luomo" }],
  creator: "luomo",
  openGraph: {
    title: "Luomo / 洛墨 - 个人云服务与数字宇宙入口",
    description: "连接云服务、API、文件、运维、终端与开发项目的个人数字空间。",
    url: "https://luomo.moe",
    siteName: "Luomo",
    images: [
      {
        url: "/assets/hero/hero-starry-control-room-generated.webp",
        width: 1200,
        height: 630,
        alt: "Luomo personal cloud portal",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luomo / 洛墨",
    description: "个人云服务与数字宇宙入口。",
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
