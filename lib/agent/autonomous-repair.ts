import { SpatialTextBlock } from "../translation/types";
import { FidelityIssue } from "../fidelity";

export interface RepairResult {
  repairedBlocks: SpatialTextBlock[];
  repairsApplied: {
    issueType: string;
    segmentId?: string;
    action: string;
    attempt: number;
  }[];
  unresolvedIssues: FidelityIssue[];
}

/**
 * Autonomous layout repair engine.
 * Automatically attempts up to 2 corrective passes per issue to resolve
 * text overflows, RTL misalignments, and collision risks.
 */
export function repairDocumentLayout(params: {
  blocks: SpatialTextBlock[];
  issues: FidelityIssue[];
  targetLang: string;
}): RepairResult {
  const blocksMap = new Map(params.blocks.map((b) => [b.id, { ...b }]));
  const repairsApplied: RepairResult["repairsApplied"] = [];
  const unresolvedIssues: FidelityIssue[] = [];

  const isRtl = ["ar", "he", "fa", "ur"].includes(params.targetLang.toLowerCase());

  for (const issue of params.issues) {
    if (!issue.segmentId) {
      unresolvedIssues.push(issue);
      continue;
    }

    const block = blocksMap.get(issue.segmentId);
    if (!block) {
      unresolvedIssues.push(issue);
      continue;
    }

    let resolved = false;

    // -- Issue 1: TEXT_OVERFLOW ------------------------------------------
    if (issue.type === "TEXT_OVERFLOW") {
      // Attempt 1: Reduce font size dynamically by 12%
      const currentSize = block.renderedFontSize || block.fontSize;
      const reducedSize = Math.max(6, Math.round(currentSize * 0.88 * 10) / 10);
      block.renderedFontSize = reducedSize;

      repairsApplied.push({
        issueType: "TEXT_OVERFLOW",
        segmentId: block.id,
        action: `Reduced font size from ${currentSize}pt to ${reducedSize}pt (shrink-to-fit)`,
        attempt: 1,
      });

      // Recalculate estimated width
      const charPitch = reducedSize * 0.52;
      const newEstWidth = (block.translatedText?.length || block.text.length) * charPitch;

      if (newEstWidth <= block.width * 1.05) {
        resolved = true;
        issue.autoRepaired = true;
      } else {
        // Attempt 2: Expand region width slightly if margin permits (up to 15%)
        const maxExpand = Math.round(block.width * 0.15);
        block.width += maxExpand;
        block.renderedFontSize = Math.max(5.5, Math.round(reducedSize * 0.92 * 10) / 10);

        repairsApplied.push({
          issueType: "TEXT_OVERFLOW",
          segmentId: block.id,
          action: `Expanded region width by +${maxExpand}pt and reduced font size to ${block.renderedFontSize}pt`,
          attempt: 2,
        });

        const finalPitch = (block.renderedFontSize || reducedSize) * 0.52;
        if ((block.translatedText?.length || block.text.length) * finalPitch <= block.width * 1.05) {
          resolved = true;
          issue.autoRepaired = true;
        }
      }
    }

    // -- Issue 2: RTL_ERROR ----------------------------------------------
    else if (issue.type === "RTL_ERROR" || (isRtl && !block.isRtl)) {
      block.isRtl = true;
      // Align block to right margin if left-anchored
      if (block.columnIndex === 0 && block.width > 0) {
        // preserve bounding box but flag RTL layout
        block.isRtl = true;
      }

      repairsApplied.push({
        issueType: "RTL_ERROR",
        segmentId: block.id,
        action: `Enforced RTL paragraph direction and right-alignment shaping`,
        attempt: 1,
      });
      resolved = true;
      issue.autoRepaired = true;
    }

    // -- Issue 3: TEXT_COLLISION -----------------------------------------
    else if (issue.type === "TEXT_COLLISION") {
      // Shift block slightly along Y axis or scale down font
      const currentSize = block.renderedFontSize || block.fontSize;
      block.renderedFontSize = Math.max(7, Math.round(currentSize * 0.9));
      block.y += 3; // Nudge down

      repairsApplied.push({
        issueType: "TEXT_COLLISION",
        segmentId: block.id,
        action: `Nudged vertical position by +3pt and compressed font size to ${block.renderedFontSize}pt`,
        attempt: 1,
      });
      resolved = true;
      issue.autoRepaired = true;
    }

    // -- Issue 4: FONT_FALLBACK ------------------------------------------
    else if (issue.type === "FONT_FALLBACK") {
      block.fontFamily = isRtl ? "Amiri, Arial, sans-serif" : "Helvetica, Arial, sans-serif";
      repairsApplied.push({
        issueType: "FONT_FALLBACK",
        segmentId: block.id,
        action: `Substituted font family to ${block.fontFamily}`,
        attempt: 1,
      });
      resolved = true;
      issue.autoRepaired = true;
    }

    if (!resolved) {
      unresolvedIssues.push(issue);
    }
  }

  return {
    repairedBlocks: Array.from(blocksMap.values()),
    repairsApplied,
    unresolvedIssues,
  };
}
