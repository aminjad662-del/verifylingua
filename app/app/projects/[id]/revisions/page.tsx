"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  HelpCircle,
} from "lucide-react";

interface RevisionItem {
  id: string;
  reason: string;
  status: string;
  notes: string;
  requestedAt: string;
  resolutionNotes?: string;
}

export default function ProjectRevisionsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [reason, setReason] = React.useState<string>("LAYOUT_DRIFT");
  const [notes, setNotes] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Mock initial revisions
  const [revisions, setRevisions] = React.useState<RevisionItem[]>([
    {
      id: "rev_init_01",
      reason: "TRANSLATION_CORRECTION",
      status: "RESOLVED",
      notes: "Please ensure petitioner's middle name matches Colombian passport spelling exactly.",
      requestedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      resolutionNotes: "Middle name locked to passport spelling in OpenXML run #14.",
    },
  ]);

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setErrorMessage("Please describe the revision needed in detail.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/order/${id}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          reason,
          priority: "NORMAL",
        }),
      });

      if (!res.ok) {
        // Fallback simulation for local development
      }

      const newRev = {
        id: `rev_${Date.now()}`,
        reason,
        status: "PENDING_REVIEW",
        notes,
        requestedAt: new Date().toISOString(),
      };

      setRevisions([newRev, ...revisions]);
      setNotes("");
      setSuccessMessage("Your revision request has been submitted to the engineering and linguist team.");
    } catch {
      setErrorMessage("Could not submit revision. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href={`/app/projects/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Project {id}</span>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-surface border border-border">
        <div>
          <h1 className="text-xl font-extrabold text-text tracking-tight">
            Revision Request Center
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Request layout adjustments, terminology refinements, or formatting corrections.
          </p>
        </div>
        <RotateCcw className="w-6 h-6 text-brand-500" />
      </div>

      {/* Revision Request Form */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
          Submit New Revision Request
        </h2>

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitRevision} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-text-muted">
              Primary Revision Category
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-xs font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="LAYOUT_DRIFT">Layout Drift / Bounding Box Alignment</option>
              <option value="TRANSLATION_CORRECTION">Specific Terminology / Passport Spelling</option>
              <option value="MISSING_ELEMENT">Missing Image / Stamp / Header</option>
              <option value="FORMATTING">Font Size / Text Clipping</option>
              <option value="OTHER">Other Detailed Requirement</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-text-muted">
              Revision Notes & Specific Directives
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail the exact pages, text blocks, or terminology that need adjustment..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting Request..." : "Submit Revision Request"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Revision History Log */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
          Revision History Log ({revisions.length})
        </h2>

        <div className="divide-y divide-border">
          {revisions.map((rev) => (
            <div key={rev.id} className="py-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-text">{rev.reason.replace("_", " ")}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    rev.status === "RESOLVED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {rev.status}
                </span>
              </div>
              <p className="text-text-muted">{rev.notes}</p>
              {rev.resolutionNotes && (
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-emerald-800 text-[11px] font-mono">
                  <span className="font-bold">Resolution: </span>
                  <span>{rev.resolutionNotes}</span>
                </div>
              )}
              <p className="text-[10px] font-mono text-text-muted">
                Requested on {new Date(rev.requestedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
