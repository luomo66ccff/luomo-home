"use client";

import { ServiceStatusProvider } from "@/components/ServiceStatusProvider";
import LuomoCompanionDock from "@/components/LuomoCompanionDock";
import { PrefsProvider, usePrefs } from "./PrefsContext";
import TopBar from "./system/TopBar";
import BootGate from "./system/BootGate";
import CommandPalette from "./system/CommandPalette";
import ConfigModal from "./system/ConfigModal";
import ToastLayer from "./system/ToastLayer";
import KeyListeners from "./system/KeyListeners";
import StarTrail from "./system/StarTrail";
import SiteFooter, { NextStop } from "./system/SiteFooter";
import PlatformHero from "./sections/PlatformHero";
import LineMap from "./sections/LineMap";
import DepartureBoard from "./sections/DepartureBoard";
import WishHall from "./sections/WishHall";
import LiveHouse from "./sections/LiveHouse";
import CgGallery from "./sections/CgGallery";
import Backlog from "./sections/Backlog";
import CafeTerminus from "./sections/CafeTerminus";

function Dock() {
  const { prefs, setLuomoChanCollapsed } = usePrefs();
  return <LuomoCompanionDock initialCollapsed={prefs.luomoChanCollapsed} onCollapsedChange={setLuomoChanCollapsed} />;
}

export default function HomeShell() {
  return (
    <PrefsProvider>
      <ServiceStatusProvider>
        <a className="skip-link" href="#main">跳到正文</a>
        <BootGate />
        <TopBar />
        <main id="main">
          <PlatformHero />
          <LineMap />
          <NextStop index="02" label="发车信息板" />
          <DepartureBoard />
          <NextStop index="03" label="祈愿" />
          <WishHall />
          <NextStop index="04" label="地下一层的 Live House" />
          <LiveHouse />
          <NextStop index="05" label="CG 鉴赏" />
          <CgGallery />
          <NextStop index="06" label="已读记录" />
          <Backlog />
          <NextStop index="07" label="终点站" />
          <CafeTerminus />
        </main>
        <SiteFooter />
        <Dock />
        <CommandPalette />
        <ConfigModal />
        <ToastLayer />
        <KeyListeners />
        <StarTrail />
      </ServiceStatusProvider>
    </PrefsProvider>
  );
}
