import Image from "next/image";
import { ArrowUpRight, Code2 } from "lucide-react";
import { HOME_PROJECTS } from "@/lib/home-content";
import styles from "./HomeExperience.module.css";

const covers = ["/assets/gallery/gallery-sci-fi-cockpit-generated.webp", "/assets/gallery/gallery-ocean-memory-generated.webp", "/assets/gallery/gallery-cyber-stage-generated.webp"];
export default function ProjectShowcase() {
  return <div className={styles.sectionInner}>
    <header className={styles.sectionHeader}><div><p className={styles.eyebrow}>02 / SELECTED WORK</p><h2 className={styles.sectionTitle}>想法落地，<span>就有了形状。</span></h2></div><a href="https://github.com/luomo66ccff" target="_blank" rel="noopener noreferrer" className={styles.textLink}>更多开源项目 <ArrowUpRight size={15} /></a></header>
    <div className={styles.projectBoard}>{HOME_PROJECTS.map((project, index) => {
      const Icon = project.icon;
      return <article className={styles.projectCard} key={project.title}>
        <a href={project.href} target="_blank" rel="noopener noreferrer" className={styles.projectCover} aria-label={"探索 " + project.title}>
          <Image src={covers[index]} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
          <span className={styles.projectCoverShade} />
          <span className={styles.projectIndex}>0{index + 1} / PERSONAL PROJECT</span>
          <span className={styles.projectEmblem}><Icon size={32} strokeWidth={1.25} /></span>
          <span className={styles.projectCoverName}>{project.title.replace("Luomo", "")}<ArrowUpRight size={24} /></span>
        </a>
        <div className={styles.projectContent}><div className={styles.projectHeader}><h3>{project.title}</h3><span>{project.subtitle}</span></div><p className={styles.projectDescription}>{project.description}</p><div className={styles.projectFooter}><span><Code2 size={14} />{project.stack.join(" / ")}</span><a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={"访问 " + project.title}><ArrowUpRight size={18} /></a></div></div>
      </article>;
    })}</div>
  </div>;
}
