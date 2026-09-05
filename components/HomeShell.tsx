"use client";

import dynamic from "next/dynamic";
import ScrollProgress from "./ScrollProgress";
import HeroCore from "./HeroCore";
import VisualWorldGallery from "./VisualWorldGallery";
import ServiceConstellation from "./ServiceConstellation";
import ProjectShowcase from "./ProjectShowcase";
import OperationsCockpit from "./OperationsCockpit";
import AboutSection from "./AboutSection";
import BuildTimeline from "./BuildTimeline";
import EnterCloudCTA from "./EnterCloudCTA";
import CommandPalette from "./CommandPalette";
import ScrollToTop from "./ScrollToTop";
import SoftFooter from "./SoftFooter";
import HomeNavigation from "./HomeNavigation";
import { ServiceStatusProvider } from "./ServiceStatusProvider";
import { useLuomoPreferences } from "@/hooks/useLuomoPreferences";
import styles from "./HomeExperience.module.css";

const LuomoCompanionDock = dynamic(() => import("./LuomoCompanionDock"), { ssr: false });
const VisualLayer = dynamic(() => import("./visual/VisualLayer"), { ssr: false });

export default function HomeShell() {
  const { prefs, setTheme, toggleParticles, setLuomoChanCollapsed } = useLuomoPreferences();
  return (
    <ServiceStatusProvider>
      <div className={styles.home}>
        <a href="#main-content" className={styles.skipLink}>跳到主要内容</a>
        <ScrollProgress />
        {prefs.particlesEnabled && <VisualLayer starfield starfieldDensity="low" sakura={false} noise={false} />}
        <HomeNavigation theme={prefs.theme} onSetTheme={setTheme} />
        <main id="main-content" tabIndex={-1}>
          <section id="hero" className={styles.hero} aria-label="欢迎来到洛墨的云端"><HeroCore /></section>
          <section id="services" className={styles.section}><ServiceConstellation /></section>
          <section id="projects" className={styles.section + " " + styles.sectionAlt}><ProjectShowcase /></section>
          <section id="operations" className={styles.section}><OperationsCockpit /></section>
          <section id="worlds" className={styles.section + " " + styles.sectionAlt}><VisualWorldGallery /></section>
          <section id="about" className={styles.section}><AboutSection /></section>
          <section id="build" className={styles.section + " " + styles.sectionAlt}><BuildTimeline /></section>
          <section id="enter" className={styles.cta}><EnterCloudCTA /></section>
        </main>
        <SoftFooter />
        <div className={styles.companionLayer}><LuomoCompanionDock onCollapsedChange={setLuomoChanCollapsed} initialCollapsed={prefs.luomoChanCollapsed} /></div>
        <ScrollToTop />
        <CommandPalette onToggleParticles={toggleParticles} onSetTheme={setTheme} particlesEnabled={prefs.particlesEnabled} />
      </div>
    </ServiceStatusProvider>
  );
}
