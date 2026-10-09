import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { getSiteName, getSiteUrl } from "@/lib/site-config";
import "./globals.css";

const stationDisplay = localFont({ src: "./fonts/station-display.woff2", variable: "--font-station", weight: "400", display: "swap", fallback: ["PingFang SC", "Microsoft YaHei", "sans-serif"] });
const wenkai = localFont({ src: "./fonts/lxgw-wenkai.woff2", variable: "--font-wenkai", weight: "400", display: "swap", fallback: ["KaiTi", "STKaiti", "serif"] });
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/cormorant-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant", display: "swap", preload: false, adjustFontFallback: "Times New Roman",
});
const jbmono = localFont({ src: "./fonts/jetbrains-mono.woff2", variable: "--font-jbmono", weight: "100 800", display: "swap", preload: false });

const siteUrl = getSiteUrl();
const siteName = getSiteName();
const description = "洛墨的个人站点与云端服务入口。服务状态、项目、风景与一班只在夜里开出的列车——下一站，由你决定。";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: siteName + " · 今晚的月色，适合出发", template: "%s · " + siteName },
  description,
  authors: [{ name: "Luomo" }],
  creator: "Luomo",
  alternates: { canonical: "/" },
  openGraph: {
    title: "洛墨站 · 夜行线", description: "写一点代码，搭几台服务器，收集沿途的星光。", url: siteUrl, siteName, locale: "zh_CN", type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "一列夜行列车驶过云海上的高架桥，铁轨化作光带通向满月" }],
  },
  twitter: { card: "summary_large_image", title: "洛墨站 · 夜行线", description: "今晚的月色，适合出发。", images: ["/og.jpg"] },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", apple: "/icons/icon-192.svg" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "洛墨站" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#070a1c" },
    { media: "(prefers-color-scheme: light)", color: "#eef7fd" },
  ],
};

const structuredData = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl.href, author: { "@type": "Person", name: "Luomo", url: siteUrl.href } };

const init = `try{var d=document.documentElement,p=JSON.parse(localStorage.getItem('luomo_prefs_v4')||'{}'),t=p&&p.theme;d.dataset.theme=t==='light'?'light':t==='system'&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';if(!sessionStorage.getItem('luomo:boarded')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.dataset.boot='1'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={[stationDisplay.variable, wenkai.variable, cormorant.variable, jbmono.variable].join(" ")}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: init }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
