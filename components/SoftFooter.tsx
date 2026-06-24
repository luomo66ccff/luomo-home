import { FOOTER, SITE } from "@/content/copy";

export default function SoftFooter() {
  const f = FOOTER;
  return (
    <footer className="relative z-10 border-t border-cyan-200/10 px-6 py-8 lg:px-10">
      <div className="mx-auto grid max-w-[1280px] items-center gap-6 text-center lg:grid-cols-[1fr_1.4fr_1fr]">
        <div className="min-w-0 text-center lg:text-left">
          <p className="text-xs tracking-[0.18em] text-cyan-200/75">
            Luomo Cloud <span className="text-fuchsia-200/45">✦</span>
          </p>
          <p className="mt-1 text-xs text-slate-400/70">
            Built with curiosity and a little anime soul
          </p>
        </div>

        <div className="min-w-0 text-center">
          <p className="text-sm font-medium tracking-[0.16em] text-cyan-50/90">
            {f.zh}
          </p>
          <p className="mt-2 text-xs tracking-[0.12em] text-slate-300/60">
            {f.en}
          </p>
          <p className="mt-1 text-xs tracking-[0.08em] text-slate-300/55">
            {f.ja}
          </p>
        </div>

        <div className="text-center lg:text-right">
          <p className="text-xs tracking-[0.22em] text-slate-400/60">
            © 2026
          </p>
        </div>
      </div>
    </footer>
  );
}