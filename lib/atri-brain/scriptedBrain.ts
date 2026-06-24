import type { AtriBrainResponse } from "./types";

const rules: { keywords: string[]; response: AtriBrainResponse }[] = [
  { keywords: ["status","状态","健康","health","how are","运行"], response: { ok: true, source: "scripted", text: "状态信号读取完成。五道星门仍在稳定发光。", mood: "system", form: "default", expression: "normal", motion: "check" } },
  { keywords: ["sleep","睡觉","晚安","休眠","rest"], response: { ok: true, source: "scripted", text: "ATRI 将进入低功耗梦境。云端灯塔仍会继续发光。", mood: "sleepy", form: "pajama", expression: "sleepy", motion: "idle" } },
  { keywords: ["hello","你好","欢迎","hi","greet"], response: { ok: true, source: "scripted", text: "欢迎回来，主人。ATRI 已从待机模式苏醒。", mood: "welcome", form: "default", expression: "smile", motion: "wave" } },
  { keywords: ["secret","秘密","彩蛋","隐藏","easter"], response: { ok: true, source: "scripted", text: "隐藏星尘协议已短暂点亮。请不要告诉别人哦。", mood: "secret", form: "pillowRight", expression: "wink", motion: "secret" } },
  { keywords: ["change","切换","换","pajama","睡衣","pajamaPants","sandals","shoes","bird","kani","pillow","bikini","dim","blood","eyes","vanish"], response: { ok: true, source: "scripted", text: "ATRI 形态已切换。请检查指令是否正确。", mood: "system", form: "default", expression: "normal", motion: "idle" } },
  { keywords: ["high performance","高性能","导航","navigation","navigate"], response: { ok: true, source: "scripted", text: "ATRI 已进入高性能导航模式。请指定目标航路。", mood: "focused", form: "default", expression: "serious", motion: "thinking" } },
];

export function scriptedBrain(message: string): AtriBrainResponse {
  const lower = message.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.response;
    }
  }
  return { ok: true, source: "scripted", text: "ATRI 收到了你的信号。云端系统一切正常。", mood: "idle", form: "default", expression: "normal", motion: "idle" };
}
