"use client";
import { ArrowUpRight, X } from "lucide-react";
import Modal from "./ui/Modal";
import { SIGNAL_LABELS, type SignalState } from "@/lib/service-signals";
import type { ServiceMeta } from "@/lib/services";
import styles from "./HomeExperience.module.css";
export default function ServiceQuickView({ service, onClose }: { service: ServiceMeta & { status: string }; onClose: () => void }) {
  return <Modal onClose={onClose} label={service.name + " 服务详情"}>
    <div className="modal-heading"><span className={styles.eyebrow}>{service.code} / SERVICE DETAIL</span><button className={styles.iconButton} onClick={onClose} aria-label="关闭服务详情"><X size={20} /></button></div>
    <h2 className="modal-title">{service.name}</h2><p className="modal-subtitle">{service.worldName}</p>
    <p className="modal-status" data-state={service.status}><span className={styles.statusDot} />{SIGNAL_LABELS[service.status as SignalState] ?? SIGNAL_LABELS.unknown}</p>
    <p className="modal-description">{service.description}</p><p className="modal-note">服务在新窗口中打开。部分私人服务需要登录后访问。</p>
    <a className={styles.primaryAction} href={service.url} target="_blank" rel="noopener noreferrer">访问 {service.name} <ArrowUpRight size={16} /></a>
  </Modal>;
}
