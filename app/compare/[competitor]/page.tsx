import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCompetitor, getAllCompetitorSlugs } from "@/lib/comparisons";
import { CompetitorComparisonView } from "@/components/comparison/CompetitorComparisonView";

interface PageProps {
  params: Promise<{
    competitor: string;
  }>;
}

export async function generateStaticParams() {
  return getAllCompetitorSlugs().map((slug) => ({
    competitor: slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { competitor } = await params;
  const profile = getCompetitor(competitor);

  if (!profile) {
    return {
      title: "Comparison Not Found | VerifyLingua",
    };
  }

  return {
    title: profile.metaTitle,
    description: profile.metaDescription,
  };
}

export default async function CompetitorComparisonPage({ params }: PageProps) {
  const { competitor } = await params;
  const profile = getCompetitor(competitor);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink-soft">
      <Header />
      <main className="flex-1">
        <CompetitorComparisonView profile={profile} />
      </main>
      <Footer />
    </div>
  );
}
