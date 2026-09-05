import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getSiteName, getSiteUrl } from "@/lib/site-config";
import "./globals.css";

const siteUrl = getSiteUrl();
const siteName = getSiteName();
export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: siteName + " · 在云端，让热爱发生", template: "%s · " + siteName },
  description: "洛墨的个人数字基地。探索云服务、开发项目与视觉世界，和 Live2D 伙伴相遇，让好奇心与热爱在云端发生。",
  authors: [{ name: "Luomo" }], creator: "Luomo",
  alternates: { canonical: "/" },
  openGraph: { title: siteName + " · 个人数字宇宙", description: "写一点代码，造一些小工具，收藏沿途的星光。", url: siteUrl, siteName, locale: "zh_CN", type: "website", images: [{ url: "/assets/hero/hero-starry-control-room-generated.webp", width: 1448, height: 1086, alt: "Luomo Cloud 星空观测站" }] },
  twitter: { card: "summary_large_image", title: siteName, description: "在云端，让热爱发生。", images: ["/assets/hero/hero-starry-control-room-generated.webp"] },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg", apple: "/icons/icon-192.svg" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Luomo" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b1017" };
const structuredData = { "@context": "https://schema.org", "@type": "WebSite", name: siteName, url: siteUrl.href, author: { "@type": "Person", name: "Luomo", url: siteUrl.href } };
const themeInit = `try{var p=JSON.parse(localStorage.getItem('luomo_prefs_v4')||'{}');var t=p&&p.theme;document.documentElement.dataset.theme=t==='light'?'light':t==='system'&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeInit }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} /></head><body>{children}</body></html>;
}
