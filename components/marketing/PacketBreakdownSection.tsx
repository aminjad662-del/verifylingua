import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, QrCode, Award, FileText, ArrowRight, Stamp } from "lucide-react";

const PACKET_PARTS = [
  {
    step: "Part 1",
    title: "Certificate of Translation Accuracy",
    badge: "8 CFR 103.2(b)(3) Sworn Affidavit",
    image: "/images/doc-certificate-3d.jpg",
    alt: "Official certificate of translation accuracy signed by ATA accredited translator",
    description:
      "A formal legal affidavit signed by an accredited translator certifying fluency in both languages and complete word-for-word competence.",
    features: [
      "American Translators Association (ATA) seal",
      "Translator signature & contact credentials",
      "Full corporate liability guarantee",
      "Optional wet notary jurat & raised seal",
    ],
  },
  {
    step: "Part 2",
    title: "Mirror-Formatted Translation",
    badge: "1:1 Tabular Layout Fidelity",
    image: "/images/docs/birth-certificate.jpg",
    alt: "Exact mirror formatted translation of foreign document matching original layout",
    description:
      "Every document is meticulously laid out to match the original structure so immigration officers can verify entries line-by-line without confusion.",
    features: [
      "All stamps, seals & emblems transcribed",
      "Hard-locked passport spelling transliteration",
      "Signatures & marginal notations bracketed",
      "Standardized US legal date conventions",
    ],
  },
  {
    step: "Part 3",
    title: "Cryptographic QR Verification",
    badge: "Instant Officer Smartphone Audit",
    image: "/images/step-qr-verified-3d.jpg",
    alt: "Public cryptographic verification QR code resolving to tamper-proof certificate ledger",
    description:
      "Every packet features a unique cryptographic SHA-256 fingerprint and QR code resolving to /verify/{code} for instant field verification.",
    features: [
      "Instant scan verification for USCIS adjudicators",
      "SHA-256 cryptographic document fingerprint",
      "Audit trail timestamp & issuance record",
      "Available 24/7 without paper notarization delay",
    ],
  },
];

export function PacketBreakdownSection() {
  return (
    <section className="py-20 md:py-32 bg-surface border-b border-border/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-500 text-xs font-bold uppercase tracking-wider font-mono">
              <FileText className="w-4 h-4" />
              What You Receive
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink tracking-tight font-display">
              Inside Your Complete Certified Translation Packet.
            </h2>
            <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
              Every VerifyLingua certified translation is delivered as an official multi-page PDF packet engineered to pass USCIS, court, and university scrutiny on the first review.
            </p>
          </div>

          <Button size="lg" asChild className="gap-2 shrink-0">
            <Link href="/order/triage">
              Start translation ($24.95/page)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* 3-Column Packet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PACKET_PARTS.map((part) => (
            <div
              key={part.step}
              className="p-6 md:p-8 rounded-[32px] bg-surface-raised border border-border flex flex-col justify-between space-y-6 shadow-sm hover:shadow-xl hover:border-brand-500/50 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="space-y-5">
                {/* Large visual document image */}
                <div className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden border border-border/60 bg-white shadow-md group-hover:scale-[1.02] transition-transform duration-300">
                  <Image
                    src={part.image}
                    alt={part.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-brand-ink/80 backdrop-blur-md text-white text-xs font-mono font-bold shadow-md border border-white/15">
                    {part.step}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-brand-500/90 backdrop-blur-sm text-white text-[10px] font-mono font-bold shadow-md">
                    USCIS Compliant
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-semibold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                    {part.badge}
                  </span>
                  <h3 className="font-display text-xl font-bold text-brand-ink leading-snug pt-1">
                    {part.title}
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed">
                    {part.description}
                  </p>
                </div>

                {/* Bullet Features */}
                <div className="space-y-2 pt-2 border-t border-border/60 text-xs text-ink-soft">
                  {part.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
