import type { ReactNode } from "react";

export default function SectionHead({ index, kicker, title, id, children }: { index: string; kicker: string; title: ReactNode; id: string; children?: ReactNode }) {
  return (
    <header className="sec-head">
      <span className="sec-index" aria-hidden="true">{index}</span>
      <p className="sec-kicker">{kicker}</p>
      <h2 className="sec-title" id={id}>{title}</h2>
      {children && <p className="sec-desc">{children}</p>}
    </header>
  );
}
