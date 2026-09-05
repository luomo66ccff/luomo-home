import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
export default function NotFound() {
  return <main className="route-message"><div><Sparkles size={28} /><p className="route-eyebrow">404 / A LITTLE OFF COURSE</p><h1>这颗星星，<br />还没有航线。</h1><p>这个页面可能已经搬走，或地址里藏了一个小小的笔误。<br />先回到云端基地，再选一个目的地吧。</p><Link href="/"><ArrowLeft size={17} /> 返回洛墨首页</Link></div></main>;
}
