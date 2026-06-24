"use client";
import { type ReactNode } from "react";

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
}

export default function SectionContainer({ id, children, className = "" }: Props) {
  return (
    <section id={id} className={"relative py-24 md:py-32 " + className}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {children}
      </div>
    </section>
  );
}
