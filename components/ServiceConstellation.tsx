"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Code2,
  Files,
  Gauge,
  Info,
  Terminal,
} from "lucide-react";
import ServiceQuickView from "./ServiceQuickView";
import { SERVICES, type ServiceMeta } from "@/lib/services";
import styles from "./HomeExperience.module.css";

type ApiService = {
  id: string;
  name: string;
  status: string;
  latency_ms: number | null;
  source: string;
};

type QuickViewService = ServiceMeta & { status: string };

const icons = {
  ops: Gauge,
  file: Files,
  api: Code2,
  terminal: Terminal,
  atri: Bot,
} as const;

function statusClass(status: string) {
  if (status === "operational") return styles.statusOperational;
  if (status === "degraded") return styles.statusDegraded;
  if (status === "down") return styles.statusDown;
  return styles.statusUnknown;
}

export default function ServiceConstellation() {
  const [statuses, setStatuses] = useState<Record<string, ApiService>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/services")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        const next: Record<string, ApiService> = {};
        (data.services || []).forEach((service: ApiService) => {
          next[service.id] = service;
        });
        setStatuses(next);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const quickViewService: QuickViewService | null = useMemo(() => {
    if (!selectedId) return null;
    const service = SERVICES.find((item) => item.id === selectedId);
    if (!service) return null;
    return { ...service, status: statuses[selectedId]?.status || "unknown" };
  }, [selectedId, statuses]);

  const readyCount = Object.values(statuses).filter(
    (service) => service.status === "operational",
  ).length;

  return (
    <div className={styles.sectionInner}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Live network</p>
          <h2 className={styles.sectionTitle}>Every service, one clear signal.</h2>
        </div>
        <div className={styles.sectionSummary}>
          <span className={styles.liveDot} aria-hidden="true" />
          <strong className={styles.summaryNumber}>
            {Object.keys(statuses).length ? readyCount + "/" + SERVICES.length : "--"}
          </strong>
          <span className={styles.summaryLabel}>services operating normally right now</span>
        </div>
      </header>

      <div className={styles.serviceGrid}>
        {SERVICES.map((service) => {
          const live = statuses[service.id];
          const state = live?.status || "unknown";
          const Icon = icons[service.id as keyof typeof icons] || Code2;

          return (
            <article className={styles.serviceCard} key={service.id}>
              <div className={styles.serviceTop}>
                <span className={styles.serviceCode}>{service.code}</span>
                <span className={styles.statusBadge + " " + statusClass(state)}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  {state}
                  {live?.latency_ms != null ? " / " + live.latency_ms + "ms" : ""}
                </span>
              </div>

              <div className={styles.serviceIcon}>
                <Icon size={19} aria-hidden="true" />
              </div>
              <h3 className={styles.serviceName}>{service.name}</h3>
              <p className={styles.serviceWorld}>{service.worldName}</p>
              <p className={styles.serviceDescription}>{service.description}</p>

              <div className={styles.serviceBottom}>
                <div className={styles.serviceMeta}>
                  {service.tags.slice(0, 2).map((tag) => (
                    <span className={styles.serviceTag} key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={styles.serviceLinks}>
                  <button
                    className={styles.serviceDetail}
                    type="button"
                    onClick={() => setSelectedId(service.id)}
                    aria-label={"View " + service.name + " details"}
                    title="View details"
                  >
                    <Info size={15} />
                  </button>
                  <a
                    className={styles.serviceLink}
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={"Open " + service.name}
                    title={"Open " + service.name}
                  >
                    <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {quickViewService && (
        <ServiceQuickView
          service={quickViewService}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
