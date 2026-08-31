"use client";

import * as React from "react";
import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sparkles,
  QrCode,
} from "lucide-react";

function AdminWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const publicCode = (params.id as string) || "VL-7X9K2";

  // Document draft states
  const [docTitle, setDocTitle] = React.useState("CERTIFICATE OF BIRTH / ACTA DE NACIMIENTO");
  const [bodyText, setBodyText] = React.useState(
    "In the Civil Registry of Madrid, Spain, on the 24th day of September 1992, appears the registration of birth for MOHAMMED ABDULLAH AL-RASHID, born at General Hospital, legitimate child of FATIMA ZAHRA AL-RASHID."
  );
  const [stampsText, setStampsText] = React.useState(
    "[ROUND OFFICIAL SEAL: Civil Registry of Madrid • Registration No. 92-B-1049 • Official Registrar Signature Attached • Stamp Duty Paid]"
  );

  // Locked Glossary Terms (§2.3)
  const lockedGlossary = React.useMemo(
    () => [
      { id: "g1", term: "MOHAMMED ABDULLAH AL-RASHID", kind: "APPLICANT_NAME" },
      { id: "g2", term: "FATIMA ZAHRA AL-RASHID", kind: "PARENT_NAME" },
    ],
    []
  );

  // USCIS Rejection QA Checklist items
  const [qaChecks, setQaChecks] = React.useState({
    stampsTranslated: true,
    layoutMirrored: true,
    namesLocked: true,
    dateFormatConsistent: true,
    competenceStatementSigned: true,
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCertified, setIsCertified] = React.useState(false);

  // Real-time Glossary Validator (§2.3)
  const glossaryValidation = React.useMemo(() => {
    const combinedTranslation = `${docTitle} ${bodyText} ${stampsText}`;
    return lockedGlossary.map((g) => {
      const isPresent = combinedTranslation.includes(g.term);
      return {
        ...g,
        valid: isPresent,
      };
    });
  }, [docTitle, bodyText, stampsText, lockedGlossary]);

  const allGlossaryValid = glossaryValidation.every((g) => g.valid);
  const allQAChecked = Object.values(qaChecks).every(Boolean);

  const handleApproveAndCertify = () => {
    if (!allGlossaryValid || !allQAChecked) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCertified(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      {/* Top Studio Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface-raised/95 backdrop-blur-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="h-8 px-3 rounded-lg gap-1.5 text-xs font-bold">
              <Link href="/admin/queue">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Queue
              </Link>
            </Button>

            <div className="flex items-center gap-2.5">
              <span className="font-mono text-sm font-black text-brand-ink">
                {publicCode}
              </span>
              <Badge variant="default" className="text-xs font-mono">
                Spanish → English
              </Badge>
              <Badge variant="success" className="text-xs">
                USCIS Spec
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCertified ? (
              <Badge variant="success" className="text-xs py-1 px-3 gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Certified & Issued to Customer
              </Badge>
            ) : (
              <Button
                onClick={handleApproveAndCertify}
                disabled={!allGlossaryValid || !allQAChecked || isSubmitting}
                className="gap-2 rounded-xl font-bold text-xs shadow-md"
              >
                {isSubmitting ? (
                  "Issuing Certificate..."
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Approve & Issue Certificate
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Split Translation Studio */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Source Document Viewer (50%) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-raised border border-border">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Source Document Scan (Page 1 of 1)
            </span>

            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-muted hover:text-brand-ink">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-muted hover:text-brand-ink">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-muted hover:text-brand-ink">
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* High-Resolution Document Render Mock */}
          <div className="rounded-[28px] border-2 border-border bg-surface p-6 shadow-inner space-y-4 min-h-[540px] text-xs font-serif leading-relaxed text-text select-text">
            <div className="text-center border-b border-border pb-3 space-y-1">
              <p className="font-bold uppercase tracking-widest text-[11px]">
                REGISTRO CIVIL DE ESPAÑA • CERTIFICADO DE NACIMIENTO
              </p>
              <p className="text-[10px] text-text-muted">TOMO 48 • PÁGINA 192 • SECCIÓN 1ª</p>
            </div>

            <div className="p-3 rounded-xl bg-canvas border border-border/80 space-y-2">
              <p>
                <strong>DON ENRIQUE SOTO,</strong> ENCARGADO DEL REGISTRO CIVIL DE MADRID:
              </p>
              <p>
                CERTIFICO: Que del Tomo 48, folio 192 de la Sección 1ª de este Registro, resulta que
                <strong> MOHAMMED ABDULLAH AL-RASHID</strong> nació en Madrid, Hospital General, el
                día veinticuatro de septiembre de mil novecientos noventa y dos.
              </p>
              <p>
                Hijo legítimo de <strong>FATIMA ZAHRA AL-RASHID</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-dashed border-border text-[11px] text-text-muted space-y-1">
              <p className="font-mono font-bold text-brand-ink">
                [SELLO REDONDO OFICIAL: REGISTRO CIVIL DE MADRID • FIRMA ILEGIBLE DEL SECRETARIO]
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Translation Editor, Locked Glossary & QA Checklist (50%) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Locked Glossary Terms Panel (§2.3) */}
          <Card className="p-5 rounded-[24px] bg-surface-raised border-2 border-brand-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-500" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink">
                  Passport Name Consistency Lock (§2.3)
                </h3>
              </div>
              <Badge variant={allGlossaryValid ? "success" : "danger"} className="text-[10px] py-0">
                {allGlossaryValid ? "100% Match" : "Mismatch Detected"}
              </Badge>
            </div>

            <div className="space-y-2">
              {glossaryValidation.map((g) => (
                <div
                  key={g.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    g.valid
                      ? "bg-status-success/10 border-status-success/30 text-brand-ink"
                      : "bg-status-danger/10 border-status-danger/30 text-status-danger"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {g.valid ? (
                      <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-status-danger shrink-0" />
                    )}
                    <span className="font-mono font-bold">{g.term}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono">
                    {g.valid ? "Verified in translation" : "Missing or misspelled"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Structured Translation Form */}
          <Card className="p-6 rounded-[28px] bg-surface-raised border border-border space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Document Header / Title Translation
              </label>
              <Input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="font-bold text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Body Translation (Complete Word-for-Word)
              </label>
              <textarea
                rows={5}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-surface text-xs leading-relaxed text-brand-ink font-sans focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Official Seals, Stamps & Watermarks Translation
              </label>
              <textarea
                rows={3}
                value={stampsText}
                onChange={(e) => setStampsText(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-surface text-xs leading-relaxed text-brand-ink font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </Card>

          {/* USCIS Rejection QA Checklist (§2) */}
          <Card className="p-6 rounded-[28px] bg-surface-raised border-2 border-brand-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                Quality Assurance
              </span>
              <h3 className="text-sm font-bold text-brand-ink">
                USCIS Rejection Prevention QA Checklist
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qaChecks.stampsTranslated}
                  onChange={(e) =>
                    setQaChecks((prev) => ({ ...prev, stampsTranslated: e.target.checked }))
                  }
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="font-semibold text-brand-ink">
                  All stamps, seals, and margin notes translated
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qaChecks.layoutMirrored}
                  onChange={(e) =>
                    setQaChecks((prev) => ({ ...prev, layoutMirrored: e.target.checked }))
                  }
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="font-semibold text-brand-ink">
                  Formatting and structure mirror original document
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qaChecks.namesLocked}
                  onChange={(e) =>
                    setQaChecks((prev) => ({ ...prev, namesLocked: e.target.checked }))
                  }
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="font-semibold text-brand-ink">
                  Passport name spellings match 100% character-for-character
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qaChecks.dateFormatConsistent}
                  onChange={(e) =>
                    setQaChecks((prev) => ({
                      ...prev,
                      dateFormatConsistent: e.target.checked,
                    }))
                  }
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="font-semibold text-brand-ink">
                  Target date format preference consistently applied
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qaChecks.competenceStatementSigned}
                  onChange={(e) =>
                    setQaChecks((prev) => ({
                      ...prev,
                      competenceStatementSigned: e.target.checked,
                    }))
                  }
                  className="rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="font-semibold text-brand-ink">
                  Signed 8 CFR 103.2(b)(3) Certificate of Accuracy & QR attached
                </span>
              </label>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AdminWorkspacePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading translation workspace...</div>}>
      <AdminWorkspaceContent />
    </Suspense>
  );
}
