import { ArrowUpRight, Code2, Heart, Sparkles } from "lucide-react";
import styles from "./HomeExperience.module.css";

export default function AboutSection() {
  return <div className={styles.sectionInner}><div className={styles.aboutPanel}>
    <div className={styles.aboutIdentity}><div className={styles.avatarTile}><span>洛</span><small>LUOMO</small><Sparkles size={22} /></div><div><strong>洛墨 / Luomo</strong><p>学生开发者 · 好奇心长期持有者</p></div><span className={styles.aboutLocation}>SOMEWHERE BETWEEN CODE & DREAMS</span></div>
    <div className={styles.aboutCopy}><p className={styles.eyebrow}>05 / THE HUMAN BEHIND THE CLOUD</p><h2 className={styles.sectionTitle}>认真折腾，<br /><span>也认真喜欢。</span></h2><p>你好呀，我是洛墨。喜欢写代码，也喜欢二次元。日常在服务器、前端、AI 和自动化之间来回穿梭，把脑海里的「要是有这个就好了」一点点变成现实。</p><p>这片云端没有宏大的使命，只是想为喜欢的事物留一个位置。工具可以实用，界面可以漂亮，而技术始终可以有温度。</p><div className={styles.interests}><span><Code2 size={14} /> Build things</span><span><Sparkles size={14} /> Stay curious</span><span><Heart size={14} /> Love the little things</span></div><a href="https://github.com/luomo66ccff" target="_blank" rel="noopener noreferrer" className={styles.textLink}>在 GitHub 找到我 <ArrowUpRight size={15} /></a></div>
  </div></div>;
}
