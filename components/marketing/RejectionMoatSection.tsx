import Image from "next/image";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, CheckCircle2, Lock, Stamp, FileSearch, QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const REJECTION_MOATS = [
  {
    title: "100% Seal & Stamp Translation",
    problem: "USCIS rejects partial translations where small rubber stamps, embossed seals, or handwriting notes are omitted.",
    solution: "Our certified linguists mirror every visual seal, stamp notation, and official emblem with bracketed verification tags.",
    icon: Stamp,
  },
  {
    title: "Passport Name & Date Consistency Lock",
    problem: "A single letter difference in name transliteration triggers a Request for Evidence (RFE) and months of delays.",
    solution: "We hard-lock your exact passport spelling into the translator workspace to guarantee 100% government record consistency.",
    icon: Lock,
  },
  {
    title: "Pre-Payment Document Quality Triage",
    problem: "Incumbents take your money first, then refund days later when an illegible handwriting or cut-off page is discovered.",
    solution: "Our AI vision model inspects resolution, glare, handwriting clarity, and missing pages in <5s before taking payment.",
    icon: FileSearch,
  },
  {
    title: "Accredited Legal Competence Statement",
    problem: "USCIS 8 CFR 103.2(b)(3) strictly requires an explicit certification of translator competence.",
    solution: "Every certificate includes a verified ATA competence declaration, translator signature, and full corporate liability backing.",
    icon: ShieldCheck,
  },
  {
    title: "Exact Visual Layout Mirroring",
    problem: "Freeform text dumps confuse immigration adjudicators and cause document matching failures.",
    solution: "Translations mirror the exact tabular layout, signatures, headers, and column positioning of your original record.",
    icon: CheckCircle2,
  },
  {
    title: "Public Cryptographic QR Verification",
    problem: "Receiving officers cannot verify the authenticity of an un-notarized paper certificate.",
    solution: "Every certificate carries an instant QR code resolving to /verify/{code} with SHA-256 cryptographic document hash.",
    icon: QrCode,
  },
];

export function RejectionMoatSection() {
  return (
    <section className="py-24 md:py-40 bg-canvas">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-[var(--r-2xl)] bg-gradient-dark-band border border-white/10 p-8 sm:p-12 md:p-16 text-white space-y-16 relative overflow-hidden shadow-2xl">
          {/* Subtle SVG Grain Overlay */}
          <div className="absolute inset-0 grain-overlay z-0 pointer-events-none" aria-hidden="true" />

          {/* Section Header with Vault Shield Art */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-brand-300 text-xs font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-brand-300" />
                <span>Research-Backed Rejection Prevention</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-[1.02] font-display">
                Why USCIS Rejects Translations — And How We Eliminate Every Risk.
              </h2>
              <p className="text-base sm:text-lg text-white/70 leading-relaxed text-lead max-w-[56ch]">
                We studied hundreds of USCIS Requests for Evidence (RFEs) and incumbent failure modes. VerifyLingua is built specifically to protect your immigration case.
              </p>
            </div>

            {/* 3D Shield Security Vault Image */}
            <div className="shrink-0 relative w-32 h-32 sm:w-40 sm:h-40 rounded-[var(--r-xl)] overflow-hidden border border-white/15 bg-white/5 shadow-2xl">
              <Image
                src="/images/trust-security-vault.jpg"
                alt="256-bit encrypted security vault shield"
                fill
                sizes="(max-width: 640px) 128px, 160px"
                className="object-cover"
              />
            </div>
          </div>

          {/* 6 Moat Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {REJECTION_MOATS.map((moat, idx) => {
              const Icon = moat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-[var(--r-xl)] bg-white/5 border border-white/10 p-7 space-y-5 backdrop-blur-sm hover:bg-white/[0.08] hover:border-brand-300/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-[var(--r-md)] bg-white/10 border border-white/15 flex items-center justify-center text-brand-300">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="text-xl font-bold text-white leading-tight">
                      {moat.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      <span className="font-semibold text-status-warning block mb-1">
                        The Risk:
                      </span>
                      {moat.problem}
                    </p>
                    <p className="text-xs text-white/90 leading-relaxed">
                      <span className="font-semibold text-brand-300 block mb-1">
                        VerifyLingua Moat:
                      </span>
                      {moat.solution}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bar in Dark Container */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-base font-bold text-white">
                Backed by our 100% Acceptance Guarantee
              </p>
              <p className="text-xs text-white/70">
                If rejected by USCIS for any translation defect, we redo it immediately free and refund 100% of your order.
              </p>
            </div>

            <Button size="lg" asChild className="gap-2 shrink-0 bg-brand-500 hover:bg-brand-700 text-white font-bold h-14 px-8 rounded-2xl shadow-lg">
              <Link href="/order/triage">
                Start translation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
