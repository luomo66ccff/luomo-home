"use client";

import { ArrowUpRight } from "lucide-react";
import { HOME_PROJECTS } from "@/lib/home-content";
import styles from "./HomeExperience.module.css";

export default function ProjectShowcase() {
  return (
    <div className={styles.sectionInner}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Project archive</p>
          <h2 className={styles.sectionTitle}>一些正在发光的云端造物。</h2>
        </div>
        <p className={styles.sectionDescription}>
          不是作品集橱窗，而是一组持续运行、持续修补、持续长出新枝条的个人项目。
        </p>
      </header>

      <div className={styles.projectBoard}>
        {HOME_PROJECTS.map((project, index) => {
          const Icon = project.icon;
          return (
            <article
              className={`${styles.projectCard} ${styles[`project-${project.accent}`]}`}
              key={project.title}
            >
              <div className={styles.projectChrome} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className={styles.projectHeader}>
                <div className={styles.projectIcon}>
                  <Icon size={20} />
                </div>
                <div>
                  <span>{project.status}</span>
                  <h3>{project.title}</h3>
                  <p>{project.subtitle}</p>
                </div>
              </div>
              <p className={styles.projectDescription}>{project.description}</p>
              <div className={styles.projectPreview} aria-label={`${project.title} terminal preview`}>
                {project.preview.map((line) => (
                  <code key={line}>
                    <span>{index + 1}</span>
                    {line}
                  </code>
                ))}
              </div>
              <div className={styles.projectFooter}>
                <div className={styles.projectStack}>
                  {project.stack.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <a href={project.href} target="_blank" rel="noopener noreferrer">
                  Visit
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
