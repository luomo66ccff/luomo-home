export type Fortune = {
  rank: "大吉" | "中吉" | "小吉" | "吉" | "末吉" | "凶";
  number: number;
  message: string;
  good: string;
  bad: string;
};

const RANKS: { rank: Fortune["rank"]; weight: number; messages: string[] }[] = [
  { rank: "大吉", weight: 12, messages: ["今天适合部署。按下回车之前，记得先喝口水。", "一发入魂的日子。想做的事情，最优先。", "「吾辈的庇佑，可不是谁都能得到的。好好珍惜吧。」——刀那边传来了声音。"] },
  { rank: "中吉", weight: 18, messages: ["灵感会在洗澡时出现，记得带上防水的便签。", "久违的老朋友会发来消息，回复要趁早。", "心里缺了一块的地方，今天会被谁轻轻补上。"] },
  { rank: "小吉", weight: 22, messages: ["今天写下的 bug，明天的你会笑着修好。", "适合把没听完的歌听完。"] },
  { rank: "吉", weight: 22, messages: ["适合整理房间，也适合整理 Git 历史。", "平平稳稳，像一班正点到站的电车。"] },
  { rank: "末吉", weight: 16, messages: ["运气在慢慢变好，就像排队等的那班末班车。", "先别急着抽卡，保底会记得你的。", "今天的谜题，答案就藏在玩笑里。"] },
  { rank: "凶", weight: 10, messages: ["今天别碰生产环境。……不过别担心，会有神明来帮忙的。", "LUCKY or UNLUCKY？——神社里的神明，好像在偷偷笑。"] },
];

const GOOD = ["写代码", "看月亮", "练吉他", "喝咖啡", "早点睡", "整理相册", "给植物浇水", "散步到车站"];
const BAD = ["熬夜", "强推 main", "凌晨改 DNS", "空腹抽卡", "在三点重构", "和猫讲道理", "删除备份", "相信「就改一行」"];

export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function drawFortune(key: string): Fortune {
  const seed = hashString("omikuji:" + key);
  const total = RANKS.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = seed % total;
  const entry = RANKS.find(candidate => (roll -= candidate.weight) < 0) ?? RANKS[RANKS.length - 1];
  const message = entry.messages[(seed >>> 8) % entry.messages.length];
  const good = GOOD[(seed >>> 12) % GOOD.length];
  let bad = BAD[(seed >>> 16) % BAD.length];
  if (bad === good) bad = BAD[0];
  return { rank: entry.rank, number: (seed % 99) + 1, message, good, bad };
}
