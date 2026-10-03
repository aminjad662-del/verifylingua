import { Suspense } from "react";
import TrackerClient from "./TrackerClient";

export function generateStaticParams() {
  return [
    { id: "view" },
  ];
}

interface TrackerPageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackerPage({ params }: TrackerPageProps) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian-900 flex items-center justify-center text-slate-500 font-mono text-sm">Loading certified tracker...</div>}>
      <TrackerClient initialId={resolvedParams?.id} />
    </Suspense>
  );
}
