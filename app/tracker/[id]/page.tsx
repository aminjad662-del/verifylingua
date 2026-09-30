import { Suspense } from "react";
import TrackerClient from "./TrackerClient";

export function generateStaticParams() {
  return [
    { id: "VL-DEMO1" },
    { id: "VL-WQEIP6EQ" },
    { id: "VL-8921-XQ" },
    { id: "VL-9104-MN" },
    { id: "demo" },
  ];
}

interface TrackerPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackerPage({ params }: TrackerPageProps) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090D14] flex items-center justify-center text-slate-500 font-mono text-sm">Loading certified tracker...</div>}>
      <TrackerClient initialId={resolvedParams?.id} />
    </Suspense>
  );
}
