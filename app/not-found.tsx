import Link from "next/link";
import RouteMessage, { MangoBox } from "@/components/home/RouteMessage";

export default function NotFound() {
  return (
    <RouteMessage
      code="404"
      eyebrow="OFF THE LINE · 本站不在线路图上"
      title={<>这一站，<br /><em>不在</em>线路图上。</>}
      art={<MangoBox />}
      actions={(
        <>
          <Link className="btn btn--gold" href="/">回到 0 号站台</Link>
          <Link className="btn" href="/#services">看看今晚的线路图</Link>
        </>
      )}
    >
      <p>您要找的页面可能已经改线，或者地址里藏了一个小小的笔误。</p>
      <small>……角落里的纸箱是怎么回事？请不要敲它，里面的人会害怕的。</small>
    </RouteMessage>
  );
}
