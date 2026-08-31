import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShieldCheck, FileCheck2, ArrowRight } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <Badge variant="default" className="gap-1.5 py-1 px-4 text-sm font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          100% Guaranteed USCIS Acceptance
        </Badge>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-brand-ink leading-[0.98]">
          Certified Translations <br className="hidden sm:inline" />
          <span className="text-brand-500">Without Rejection Risk.</span>
        </h1>

        <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
          Official human translations for immigration, academic evaluation, and courts.
          Backed by instant pre-payment AI document triage and guaranteed verification.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button size="lg" asChild className="gap-2 text-base px-8 h-14 rounded-2xl shadow-md">
            <Link href="/order/triage">
              Start translation
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          <Button size="lg" variant="secondary" asChild className="text-base px-8 h-14 rounded-2xl">
            <Link href="/dev/tokens">
              Explore Design System
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <Card className="border-border/80 bg-surface-raised/80 backdrop-blur-sm shadow-sm hover:border-brand-500/40 transition-colors">
            <CardHeader>
              <FileCheck2 className="w-8 h-8 text-brand-500 mb-2" />
              <CardTitle className="text-xl font-bold text-brand-ink">Pre-Payment Triage</CardTitle>
              <CardDescription>
                Identifies blurry pages, cut-off seals, and handwriting issues before you pay.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/80 bg-surface-raised/80 backdrop-blur-sm shadow-sm hover:border-brand-500/40 transition-colors">
            <CardHeader>
              <ShieldCheck className="w-8 h-8 text-brand-500 mb-2" />
              <CardTitle className="text-xl font-bold text-brand-ink">Name & Date Lock</CardTitle>
              <CardDescription>
                Hard-locks passport spellings and date formats to prevent silent RFE rejections.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/80 bg-surface-raised/80 backdrop-blur-sm shadow-sm hover:border-brand-500/40 transition-colors">
            <CardHeader>
              <FileCheck2 className="w-8 h-8 text-brand-500 mb-2" />
              <CardTitle className="text-xl font-bold text-brand-ink">Public QR Portal</CardTitle>
              <CardDescription>
                Receiving officers instantly verify document hash and translator credentials.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
