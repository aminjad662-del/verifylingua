import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Completely hide the admin panel if the user is not authenticated or not an admin
  if (!user || user.role !== "ADMIN") {
    notFound();
  }

  return <>{children}</>;
}
