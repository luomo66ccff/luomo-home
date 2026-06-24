import { ArrowRight, Bot, Code2, ExternalLink, Files, Gauge, Terminal } from "lucide-react";
import MotionSection from "./MotionSection";
import { visualAssets } from "@/lib/visual-assets";

const gates = [
  { label: "进入系统", desc: "LuomoOps · 云端控制台", href: "https://ops.luomo.moe", icon: Gauge },
  { label: "开启档案馆", desc: "LuomoFile · 文件星座", href: "https://file.luomo.moe", icon: Files },
  { label: "开发者之门", desc: "LuomoAPI · 网关接口", href: "https://api.luomo.moe", icon: Code2 },
  { label: "终端连接", desc: "LuomoTerminal · SSH桥接", href: "https://terminal.luomo.moe", icon: Terminal },
  { label: "唤醒星灵", desc: "AstrBot API · 自动化桥接", href: "https://atri-api.luomo.moe", icon: Bot },
];

export default function EnterCloudCTA() {
  const handleGateHover = () => { window.dispatchEvent(new CustomEvent("luomo:mood", { detail: { mood: "excited" } })); };
  return (
    <MotionSection id="enter" className="cta-scene w-full">
      <div className="vn-choice-screen" onMouseEnter={handleGateHover}>
        <div
          className="vn-choice-bg"
          style={{ backgroundImage: `url(${visualAssets.hero.primary})` }}
          aria-hidden="true"
        />
        <div className="vn-choice-mask" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-[640px] mx-auto px-6">
          <div className="vn-dialog-box text-center">
            <div className="vn-nameplate left-1/2 -translate-x-1/2" style={{ left: "50%", transform: "translateX(-50%)" }}>
              SCENE 07 · FATE SELECT
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-2"
              style={{
                background: "linear-gradient(135deg, #eaf6ff, #a5f3fc 38%, #f9a8d4 72%, #fde68a)",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                textShadow: "0 0 42px rgba(34,211,238,0.14)"
              }}>
              Ready to initiate the jump?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-4 leading-relaxed">
              Choose your fate and step into the cloud.
            </p>

            <div className="flex flex-col gap-3 mt-4">
              {gates.map((gate) => {
                const Icon = gate.icon;
                return (
                  <a
                    key={gate.href}
                    href={gate.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vn-choice-btn group justify-between"
                    aria-label={`Open ${gate.desc}`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={20} className="text-cyan-300" />
                      <span>
                        <span className="block text-white font-bold">{gate.label}</span>
                        <span className="block text-xs text-slate-400 font-normal mt-0.5">{gate.desc}</span>
                      </span>
                    </span>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-cyan-300 transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          <footer className="text-center mt-8">
            <span className="text-xs text-slate-500">
              Built by luomo · Powered by curiosity, infrastructure, and a little anime soul ✦
            </span>
          </footer>
        </div>
      </div>
    </MotionSection>
  );
}