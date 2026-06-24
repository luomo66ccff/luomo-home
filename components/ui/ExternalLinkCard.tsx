import { ReactNode } from "react";

interface Props {
  href: string;
  label: string;
  desc?: string;
  icon?: ReactNode;
  className?: string;
}

export default function ExternalLinkCard({ href, label, desc, icon, className = "" }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={"vn-choice-btn group justify-between " + className}
    >
      <span className="flex items-center gap-3">
        {icon && <span className="text-cyan-300 shrink-0">{icon}</span>}
        <span>
          <span className="block text-white font-bold">{label}</span>
          {desc && <span className="block text-xs text-slate-400 font-normal mt-0.5">{desc}</span>}
        </span>
      </span>
      <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
      </svg>
    </a>
  );
}
