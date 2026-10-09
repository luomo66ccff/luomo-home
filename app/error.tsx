"use client";

import RouteMessage, { SignalLight } from "@/components/home/RouteMessage";

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <RouteMessage
      code="STOP"
      eyebrow="SIGNAL FAULT · 信号故障"
      title={<>列车<em>临时停运</em>。</>}
      art={<SignalLight />}
      actions={(
        <>
          <button type="button" className="btn btn--gold" onClick={reset}>重新发车</button>
          <a className="btn" href="/">回到 0 号站台</a>
        </>
      )}
    >
      <p>本次列车因信号故障临时停车，给您的旅途带来不便，深表歉意。</p>
      <small>乘务员正在排查。如果反复停车，请稍后再来。{error.digest ? ` 故障编号：${error.digest}` : ""}</small>
    </RouteMessage>
  );
}
