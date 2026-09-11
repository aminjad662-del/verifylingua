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
  
  const [orders, setOrders] = React.useState<OrderDetail[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(true);

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

  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/orders");
      if (res.ok) {
        const data = await res.json();
        const mappedOrders: OrderDetail[] = (data.orders || []).map((o: any) => ({
          id: o.id,
          publicCode: o.publicCode,
          documentName: o.uploadedFiles?.[0]?.name || `${o.serviceType} Translation`,
          matterNumber: o.matterNumber || "Standard Filing",
          sourceLang: o.sourceLang,
          targetLang: o.targetLangs?.[0] || "English",
          status: o.status,
          statusLabel: o.status.replace(/_/g, " "),
          pages: o.pageCount,
          total: o.total,
          promisedAt: o.status === "COMPLETED" ? "Delivered" : new Date(o.promisedAt).toLocaleDateString(),
          translator: o.assignedTranslator || "Pending Assignment",
          verifyCode: o.publicCode,
          sha256Hash: o.deliveredFiles?.[0]?.sha256 || undefined,
        }));
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.warn("Failed to fetch orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  React.useEffect(() => {
    fetchJobs();
    fetchOrders();

    // Poll every 4 seconds for live engine updates
    const interval = setInterval(() => {
      fetchJobs();
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchJobs, fetchOrders]);

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
              orders={orders}
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
