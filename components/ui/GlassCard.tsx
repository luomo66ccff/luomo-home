import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: "div" | "article" | "button";
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function GlassCard({ children, className = "", hover = false, as: Tag = "div", onClick, onMouseEnter, onMouseLeave }: Props) {
  return (
    <Tag
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={
        "glass-card relative rounded-[28px] border border-cyan-200/12 bg-slate-950/55 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl transition-all duration-300 " +
        (hover ? "hover:-translate-y-1 hover:shadow-[0_18px_70px_rgba(2,6,23,0.35),0_0_40px_rgba(34,211,238,0.08)] cursor-pointer " : "") +
        className
      }
    >
      {children}
    </Tag>
  );
}
