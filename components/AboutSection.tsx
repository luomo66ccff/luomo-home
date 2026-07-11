import { ABOUT_SIGNALS } from "@/lib/home-content";
import styles from "./HomeExperience.module.css";

export default function AboutSection() {
  return (
    <div className={styles.sectionInner}>
      <div className={styles.aboutPanel}>
        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>About Luomo</p>
          <h2 className={styles.sectionTitle}>在现实之外，给兴趣搭一座可登录的云端基地。</h2>
          <p>
            洛墨是一个学生开发者维护的个人数字空间。这里收纳云服务、API、文件、运维入口、
            自动化工具和看板娘陪伴，也记录那些从兴趣慢慢变成真实项目的过程。
          </p>
          <p>
            它不想像企业官网，也不想只做漂亮壳子。更像一间漂浮在星空里的工作室：
            有服务心跳，有终端回声，也有一点二次元灵魂。
          </p>
        </div>

        <div className={styles.aboutSignals} aria-label="Luomo keywords">
          {ABOUT_SIGNALS.map((item) => {
            const Icon = item.icon;
            return (
              <article className={styles.aboutSignal} key={item.label}>
                <Icon size={17} aria-hidden="true" />
                <h3>{item.label}</h3>
                <p>{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
