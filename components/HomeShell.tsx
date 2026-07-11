"use client";

import ScrollProgress from "@/components/ScrollProgress";
import VisualLayer from "@/components/visual/VisualLayer";
import LuomoCompanionDock from "@/components/LuomoCompanionDock";
import HeroCore from "@/components/HeroCore";
import VisualWorldGallery from "@/components/VisualWorldGallery";
import ServiceConstellation from "@/components/ServiceConstellation";
import ProjectShowcase from "@/components/ProjectShowcase";
import OperationsCockpit from "@/components/OperationsCockpit";
import AboutSection from "@/components/AboutSection";
import BuildTimeline from "@/components/BuildTimeline";
import EnterCloudCTA from "@/components/EnterCloudCTA";
import CommandPalette from "@/components/CommandPalette";
import ScrollToTop from "@/components/ScrollToTop";
import SoftFooter from "@/components/SoftFooter";
import HomeNavigation from "@/components/HomeNavigation";
import { useLuomoPreferences } from "@/hooks/useLuomoPreferences";
import styles from "./HomeExperience.module.css";

export default function HomeShell() {
  const { prefs, setTheme, toggleParticles, setLuomoChanCollapsed } = useLuomoPreferences();

  return (
    <main suppressHydrationWarning className={styles.home}>
      <ScrollProgress />
      <VisualLayer
        enabled={prefs.particlesEnabled}
        starfield
        starfieldDensity="low"
        sakura
        noise
      />
      <HomeNavigation />
      <div className={styles.companionLayer}>
        <LuomoCompanionDock
          onCollapsedChange={setLuomoChanCollapsed}
          initialCollapsed={prefs.luomoChanCollapsed}
        />
      </div>
      <ScrollToTop />

      <section id="hero" className={styles.hero}>
        <HeroCore />
      </section>

      <section id="services" className={styles.section}>
        <ServiceConstellation />
      </section>

      <section id="projects" className={styles.section + " " + styles.projectSection}>
        <ProjectShowcase />
      </section>

      <section id="operations" className={styles.section + " " + styles.sectionAlt}>
        <OperationsCockpit />
      </section>

      <section id="about" className={styles.section}>
        <AboutSection />
      </section>

      <section id="worlds" className={styles.section}>
        <VisualWorldGallery />
      </section>

      <section id="build" className={styles.section + " " + styles.sectionAlt}>
        <BuildTimeline />
      </section>

      <section id="enter" className={styles.cta}>
        <EnterCloudCTA />
      </section>

      <SoftFooter />

      <CommandPalette
        onToggleParticles={toggleParticles}
        onSetTheme={setTheme}
        particlesEnabled={prefs.particlesEnabled}
      />
    </main>
  );
}
