"use client";
export default function AmbientGlow() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div className="absolute left-[-10%] top-0 h-[60%] w-[40%] rounded-full bg-gradient-to-br from-cyan-300/4 to-transparent blur-[120px]" />
      <div className="absolute right-[-10%] bottom-[20%] h-[50%] w-[35%] rounded-full bg-gradient-to-tl from-pink-400/3 to-transparent blur-[100px]" />
      <div className="absolute left-[30%] top-[40%] h-[30%] w-[30%] rounded-full bg-gradient-to-r from-purple-400/2 to-transparent blur-[80px]" />
    </div>
  );
}
