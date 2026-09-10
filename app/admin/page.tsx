import { AdminExecutiveOverview } from "@/components/admin/AdminExecutiveOverview";

export const metadata = {
  title: "Admin Executive Console | VerifyLingua",
  description: "Executive operational telemetry, ATA linguist throughput, and order lifecycle management.",
};

export default function AdminPage() {
  return <AdminExecutiveOverview />;
}
