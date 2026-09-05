"use client";
import { RefreshCw } from "lucide-react";
export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="route-message"><div><RefreshCw size={28} /><p className="route-eyebrow">CONNECTION INTERRUPTED</p><h1>信号暂时<br />绕了个远路。</h1><p>页面未能完成加载，请再试一次。</p><button type="button" onClick={reset}><RefreshCw size={17} /> 重新加载</button></div></main>;
}
