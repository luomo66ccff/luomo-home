"use client";

import { useState, useEffect } from "react";
import BootSequence from "@/components/BootSequence";
import AmbientGlow from "@/components/effects/AmbientGlow";
import HologramGrid from "@/components/effects/HologramGrid";
import ScrollProgress from "@/components/ScrollProgress";
import MouseGlow from "@/components/MouseGlow";
import VisualLayer from "@/components/visual/VisualLayer";
import LuomoCompanionDock from "@/components/LuomoCompanionDock";
import HeroCore from "@/components/HeroCore";
import MotionSection from "@/components/MotionSection";
import VisualWorldGallery from "@/components/VisualWorldGallery";
import ServiceConstellation from "@/components/ServiceConstellation";
import OperationsCockpit from "@/components/OperationsCockpit";
import InfrastructureOrbit from "@/components/InfrastructureOrbit";
import BuildTimeline from "@/components/BuildTimeline";
import EnterCloudCTA from "@/components/EnterCloudCTA";
import CommandPalette from "@/components/CommandPalette";
import SectionNavigator from "@/components/SectionNavigator";
import ScrollToTop from "@/components/ScrollToTop";
import SoftFooter from "@/components/SoftFooter";
import { useLuomoPreferences } from "@/hooks/useLuomoPreferences";

export default function HomeShell() {
  const { prefs, setTheme, toggleParticles, setLuomoChanCollapsed } = useLuomoPreferences();
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBootComplete(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main suppressHydrationWarning className="relative min-h-screen bg-[#020617] overflow-x-hidden">
      {!bootComplete && <BootSequence />}
      <ScrollProgress />
      <MouseGlow />
      <VisualLayer starfield={prefs.particlesEnabled} sakura={prefs.particlesEnabled} noise={true} enabled={prefs.particlesEnabled} />
      <LuomoCompanionDock
        onCollapsedChange={setLuomoChanCollapsed}
        initialCollapsed={prefs.luomoChanCollapsed}
      />
      <SectionNavigator />
      <ScrollToTop />

      <section id="hero" className="relative min-h-screen overflow-hidden bg-[#020617]">
        <HeroCore />
      </section>

      <section id="visual-world" className="relative py-24 md:py-32">
        <MotionSection><VisualWorldGallery /></MotionSection>
      </section>

      <section id="service-constellation" className="relative py-24 md:py-32">
        <MotionSection><ServiceConstellation /></MotionSection>
      </section>

      <section id="operations-cockpit" className="relative py-24 md:py-32">
        <MotionSection><OperationsCockpit /></MotionSection>
      </section>

      <section id="infrastructure-orbit" className="relative py-24 md:py-32">
        <MotionSection><InfrastructureOrbit /></MotionSection>
      </section>

      <section id="build-log" className="relative py-24 md:py-32">
        <MotionSection><BuildTimeline /></MotionSection>
      </section>

      <section id="enter-cloud" className="relative min-h-dvh flex items-center justify-center overflow-hidden">
        <MotionSection><EnterCloudCTA /></MotionSection>
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