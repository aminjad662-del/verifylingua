"use client";

import * as React from "react";
import { motion } from "motion/react";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TelemetryStream, RealTranslationJob } from "@/components/dashboard/TelemetryStream";
import { OrderVault } from "@/components/dashboard/OrderVault";
import { OrderDrawer, OrderDetail } from "@/components/dashboard/OrderDrawer";
import { LegalToolkitBento } from "@/components/dashboard/LegalToolkitBento";
import { ToastContainer } from "@/components/dashboard/ToastNotification";

const INITIAL_ORDERS: OrderDetail[] = [
  {
    id: "ord-1",
    publicCode: "VL-7X9K2",
    documentName: "Acta de Nacimiento (Certified Birth Certificate)",
    matterNumber: "Matter #USCIS-I485-8910 (Hernandez Adjustment)",
    sourceLang: "Spanish",
    targetLang: "English",
    status: "TRANSLATING",
    statusLabel: "In Translation",
    pages: 1,
    total: 24.95,
    promisedAt: "Tomorrow at 9:00 AM EST",
    translator: "Elena V. (ATA Member No. 271892)",
    verifyCode: "CERT-7X9K2-4821",
    sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  },
  {
    id: "ord-2",
    publicCode: "VL-3M8Q1",
    documentName: "Título Universitario (Bachelor of Laws Degree)",
    matterNumber: "Matter #WES-EVAL-3920 (Academic Equivalency)",
    sourceLang: "Spanish",
    targetLang: "English",
    status: "DELIVERED",
    statusLabel: "Certified & Delivered",
    pages: 2,
    total: 49.90,
    promisedAt: "Delivered Aug 28, 2026",
    translator: "Carlos M. (ATA Member No. 194820)",
    verifyCode: "CERT-3M8Q1-9014",
    sha256Hash: "7a9b2c8f0d1e3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
  },
  {
    id: "ord-3",
    publicCode: "VL-DEMO1",
    documentName: "Certificado de Matrimonio (Marriage Certificate)",
    matterNumber: "Matter #I-130-PETITION-4412 (Spousal Visa)",
    sourceLang: "Spanish",
    targetLang: "English",
    status: "PROOFING",
    statusLabel: "Proofing Studio Ready",
    pages: 2,
    total: 49.90,
    promisedAt: "Ready for Customer Review",
    translator: "Elena V. (ATA Member No. 271892)",
    verifyCode: "VL-CERT-8921",
    sha256Hash: "c18a9e0f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e",
  },
  {
    id: "ord-4",
    publicCode: "VL-9104-MN",
    documentName: "Constancia de Antecedentes No Penales (Police Clearance)",
    matterNumber: "Matter #EOIR-DEFENSE-1092 (Court Exhibit B)",
    sourceLang: "Spanish",
    targetLang: "English",
    status: "DELIVERED",
    statusLabel: "Court Sealed & Delivered",
    pages: 1,
    total: 24.95,
    promisedAt: "Delivered Sep 02, 2026",
    translator: "Tariq A. (ATA Member No. 310984)",
    verifyCode: "CERT-9104-MN-8812",
    sha256Hash: "f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    },
  },
};

export default function DashboardPage() {
  const [realJobs, setRealJobs] = React.useState<RealTranslationJob[]>([]);
  const [loadingJobs, setLoadingJobs] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderDetail | null>(null);

  const fetchJobs = React.useCallback(async () => {
    try {
      const res = await fetch("/api/translate/jobs");
      if (res.ok) {
        const data = await res.json();
        setRealJobs(data.jobs || []);
      }
    } catch (err) {
      console.warn("Failed to fetch translation jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  React.useEffect(() => {
    fetchJobs();

    // Poll every 4 seconds for live engine updates
    const interval = setInterval(() => {
      fetchJobs();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchJobs]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* 1. Spyglass-Style Editorial Hero Header */}
          <motion.div variants={itemVariants}>
            <DashboardHeader />
          </motion.div>

          {/* 2. Dark Command Center / Telemetry Stream */}
          <motion.div variants={itemVariants}>
            <TelemetryStream
              jobs={realJobs}
              onRefresh={fetchJobs}
              loading={loadingJobs}
            />
          </motion.div>

          {/* 3. Interactive Evidentiary Order Vault */}
          <motion.div variants={itemVariants}>
            <OrderVault
              orders={INITIAL_ORDERS}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
            />
          </motion.div>

          {/* 4. Spyglass "Plus the rest of the toolkit" Bento */}
          <motion.div variants={itemVariants}>
            <LegalToolkitBento />
          </motion.div>
        </motion.div>
      </main>

      {/* Spring-Animated Slide-Over Record Inspector Drawer */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />

      <Footer />
    </div>
  );
}
