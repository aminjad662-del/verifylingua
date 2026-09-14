"use client";

import React, { useState } from "react";
import { Star, CheckCircle2, AlertCircle, X, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PostDownloadFeedbackProps {
  jobId: string;
  userRole?: string;
  onDismiss?: () => void;
  onSubmitSuccess?: (feedbackId: string) => void;
  className?: string;
}

const ISSUE_TAGS = [
  { id: "NONE", label: "No issues / Clean layout" },
  { id: "LAYOUT_SHIFT", label: "Layout shift" },
  { id: "FONT_SIZE", label: "Font sizing" },
  { id: "TABLE_MISALIGNED", label: "Table misaligned" },
  { id: "OTHER", label: "Other minor issue" },
] as const;

const VALUE_VERDICTS = [
  { id: "GREAT_VALUE", label: "Great value" },
  { id: "FAIR", label: "Fair" },
  { id: "TOO_EXPENSIVE", label: "Too expensive" },
] as const;

/**
 * High-density, tactile post-download feedback card.
 * Gathers 1-5 star formatting fidelity ratings and pricing sentiment for pilot calibration.
 */
export function PostDownloadFeedback({
  jobId,
  userRole,
  onDismiss,
  onSubmitSuccess,
  className,
}: PostDownloadFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [issueTag, setIssueTag] = useState<string>("NONE");
  const [valueVerdict, setValueVerdict] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRatingSelect = (selected: number) => {
    setRating(selected);
    setErrorMessage(null);
  };

  /**
   * Submit feedback with resilient retry logic on 429 rate limits.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMessage("Please select a 1–5 star rating to submit feedback.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      jobId,
      rating,
      issueTag: issueTag || null,
      valueVerdict: valueVerdict || null,
      comment: comment.trim() || null,
      userRole: userRole || null,
    };

    let attempts = 0;
    const maxAttempts = 3;
    let success = false;
    let feedbackId = "";

    while (attempts < maxAttempts && !success) {
      try {
        attempts++;
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.status === 429) {
          // Rate limited: wait with exponential backoff and retry
          if (attempts < maxAttempts) {
            await new Promise((resolve) =>
              setTimeout(resolve, 500 * Math.pow(2, attempts - 1))
            );
            continue;
          }
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        feedbackId = data.feedbackId || "";
        success = true;
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          setErrorMessage(err.message || "Failed to submit feedback. Please try again.");
        }
      }
    }

    setIsSubmitting(false);

    if (success) {
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(feedbackId);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "relative w-full rounded-lg border border-border-strong bg-surface-elevated p-6 text-brand-ink shadow-sm transition-all duration-200",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-success/10 text-status-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-text-muted">
                Calibration Recorded
              </span>
            </div>
            <h4 className="mt-1 text-base font-semibold text-brand-ink">
              Thank you for calibrating VerifyLingua!
            </h4>
            <p className="mt-1 text-sm text-text-muted">
              Your feedback directly tunes our document layout reconstruction engine.
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              type="button"
              aria-label="Close message"
              className="rounded p-1 text-text-muted transition-colors hover:bg-surface-sunken hover:text-brand-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full rounded-lg border border-border-strong bg-surface-elevated p-6 text-brand-ink shadow-sm",
        className
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-ink">
            Rate Translation Fidelity
          </h3>
          <span className="rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase text-text-muted">
            Pilot Telemetry
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            type="button"
            aria-label="Dismiss feedback"
            className="rounded p-1 text-text-muted transition-colors hover:bg-surface-sunken hover:text-brand-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-5">
        {/* Star Rating Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-brand-ink">
            1. Layout & Formatting Accuracy <span className="text-status-danger">*</span>
          </label>
          <p className="mt-0.5 text-xs text-text-muted">
            Did the translated document preserve tables, typography, and page boundaries?
          </p>
          <div className="mt-2.5 flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isFilled =
                (hoverRating || rating) >= starValue;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => handleRatingSelect(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500",
                    isFilled
                      ? "border-amber-400 bg-amber-500/10 text-amber-500"
                      : "border-border bg-canvas text-text-muted hover:border-border-strong hover:text-brand-ink"
                  )}
                >
                  <Star
                    className={cn(
                      "h-5 w-5",
                      isFilled ? "fill-amber-500 text-amber-500" : "text-text-muted"
                    )}
                  />
                </button>
              );
            })}
            <span className="ml-3 font-mono text-xs text-text-muted">
              {rating > 0 ? `${rating} / 5 Stars` : "Select rating"}
            </span>
          </div>
        </div>

        {/* Issue Tag Buttons */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-brand-ink">
            2. Any formatting flaws?
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {ISSUE_TAGS.map((tag) => {
              const isSelected = issueTag === tag.id;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setIssueTag(tag.id)}
                  className={cn(
                    "rounded border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500",
                    isSelected
                      ? "border-brand-500 bg-brand-500/10 text-brand-ink font-semibold"
                      : "border-border bg-canvas text-text-muted hover:border-border-strong hover:text-brand-ink"
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing Verdict */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-brand-ink">
            3. Value Assessment
          </label>
          <p className="mt-0.5 text-xs text-text-muted">
            Was this translation worth $0.30–$0.40/page to your workflow?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VALUE_VERDICTS.map((verdict) => {
              const isSelected = valueVerdict === verdict.id;
              return (
                <button
                  key={verdict.id}
                  type="button"
                  onClick={() =>
                    setValueVerdict(isSelected ? "" : verdict.id)
                  }
                  className={cn(
                    "rounded border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500",
                    isSelected
                      ? "border-brand-ink bg-brand-ink text-white font-semibold"
                      : "border-border bg-canvas text-text-muted hover:border-border-strong hover:text-brand-ink"
                  )}
                >
                  {verdict.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Comment Input */}
        <div>
          <label
            htmlFor="feedback-comment"
            className="block text-xs font-semibold uppercase tracking-wide text-brand-ink"
          >
            4. Additional Comments <span className="text-text-muted font-normal">(Optional)</span>
          </label>
          <textarea
            id="feedback-comment"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what could make this document perfect..."
            className="mt-1.5 w-full rounded border border-border bg-canvas px-3 py-2 text-xs text-brand-ink placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded border border-status-danger/20 bg-status-danger/10 px-3 py-2 text-xs text-status-danger"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs text-text-muted hover:text-brand-ink transition-colors"
            >
              Skip for now
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="inline-flex items-center justify-center gap-2 rounded bg-brand-ink px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Submit Feedback</span>
          </button>
        </div>
      </form>
    </div>
  );
}
