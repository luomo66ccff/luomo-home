import type { ReactNode } from "react";

export default function ModalBody({ onClose, children, className = "" }: { onClose: () => void; children: ReactNode; className?: string }) {
  return (
    <div className={`modal-body ${className}`}>
      <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      {children}
    </div>
  );
}
