"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { galleryItems } from "@/lib/visual-assets";
import styles from "./HomeExperience.module.css";

type StatusItem = {
  id: string;
  name: string;
  status: string;
  latency_ms: number | null;
};

function statusClass(status: string) {
  if (status === "operational") return styles.statusOperational;
  if (status === "degraded") return styles.statusDegraded;
  if (status === "down") return styles.statusDown;
  return styles.statusUnknown;
}

export default function OperationsCockpit() {
  const [services, setServices] = useState<StatusItem[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServices = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/services", { cache: "no-store" });
      const data = await response.json();
      setServices(data.services || []);
      setLastChecked(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setLastChecked("unavailable");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const metrics = useMemo(() => {
    const operational = services.filter((service) => service.status === "operational").length;
    const attention = services.filter((service) =>
      ["degraded", "down"].includes(service.status),
    ).length;
    const latencies = services
      .map((service) => service.latency_ms)
      .filter((latency): latency is number => latency != null)
      .sort((a, b) => a - b);
    const middle = Math.floor(latencies.length / 2);
    const median = latencies.length
      ? latencies.length % 2
        ? latencies[middle]
        : Math.round((latencies[middle - 1] + latencies[middle]) / 2)
      : null;

    return { operational, attention, median };
  }, [services]);

  const cockpitImage =
    galleryItems.find((item) => item.key === "sci-fi-cockpit")?.src ||
    "/assets/gallery/gallery-sci-fi-cockpit-generated.webp";

  return (
    <div className={styles.sectionInner}>
      <header className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Operations</p>
          <h2 className={styles.sectionTitle}>A calmer view of the moving parts.</h2>
        </div>
        <p className={styles.sectionDescription}>
          Health checks and latency are reduced to the signals that matter, while the
          full cockpit remains one click away in LuomoOps.
        </p>
      </header>

      <div className={styles.operationsGrid}>
        <div className={styles.operationsVisual}>
          <img
            className={styles.operationsImage}
            src={cockpitImage}
            alt="Luomo Cloud operations cockpit"
            loading="lazy"
          />
          <div className={styles.operationsShade} aria-hidden="true" />
          <div className={styles.operationsCaption}>
            <span>CONTROL SURFACE / TOKYO</span>
            <h3>Infrastructure should feel legible before it feels impressive.</h3>
            <div className={styles.metrics}>
              <div className={styles.metric}>
                <strong>{services.length ? metrics.operational : "--"}</strong>
                <span>Operational</span>
              </div>
              <div className={styles.metric}>
                <strong>{services.length ? metrics.attention : "--"}</strong>
                <span>Needs attention</span>
              </div>
              <div className={styles.metric}>
                <strong>{metrics.median != null ? metrics.median + "ms" : "--"}</strong>
                <span>Median response</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.signals}>
          <div className={styles.signalHeader}>
            <div>
              <p>Service signals</p>
              <span>{lastChecked ? "updated " + lastChecked : "waiting for live data"}</span>
            </div>
            <button
              className={styles.iconButton}
              type="button"
              onClick={fetchServices}
              disabled={refreshing}
              aria-label="Refresh service status"
              title="Refresh service status"
            >
              <RefreshCw className={refreshing ? styles.spinning : undefined} size={15} />
            </button>
          </div>

          {services.length ? (
            <ul className={styles.signalList}>
              {services.map((service) => (
                <li className={styles.signalRow} key={service.id}>
                  <div className={styles.signalIdentity}>
                    <span
                      className={styles.statusBadge + " " + statusClass(service.status)}
                      aria-hidden="true"
                    >
                      <span className={styles.statusDot} />
                    </span>
                    <div>
                      <strong>{service.name}</strong>
                      <span>{service.id.toUpperCase()} / LIVE CHECK</span>
                    </div>
                  </div>
                  <div className={styles.signalState}>
                    <span className={styles.signalLatency}>
                      {service.latency_ms != null ? service.latency_ms + "ms" : "--"}
                    </span>
                    <span className={styles.statusBadge + " " + statusClass(service.status)}>
                      {service.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>Collecting service signals...</p>
          )}
        </div>
      </div>
    </div>
  );
}
