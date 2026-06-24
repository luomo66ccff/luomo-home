"use client";

import type { CompanionId } from "@/lib/companions/companionRegistry";
import {
  companionOrder,
  getCompanionProfile,
} from "@/lib/companions/companionRegistry";

interface Props {
  value: CompanionId;
  onChange: (id: CompanionId) => void;
  disabled?: boolean;
}

export function CharacterSwitcher({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <div className="my-3 w-full">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/55">
        Companion
      </div>

      <div className="grid w-full grid-cols-3 gap-1.5 rounded-2xl border border-cyan-200/15 bg-black/25 p-1.5">
        {companionOrder.map((id) => {
          const profile = getCompanionProfile(id);
          const active = id === value;

          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => {
                console.info("[CompanionSwitcher] click", id);
                onChange(id);
              }}
              className={[ "min-w-0 truncate",
                "min-w-0 truncate rounded-xl px-2 py-1.5 text-[11px] font-semibold transition sm:text-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60",
                active
                  ? "bg-cyan-300/20 text-cyan-50 shadow-[0_0_16px_rgba(34,211,238,0.24)]"
                  : "text-slate-300/75 hover:bg-white/10 hover:text-white",
                disabled ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
              title={profile.displayName}
            >
              {profile.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
