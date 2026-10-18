import { describe, it, expect } from "vitest";
import {
  verifyElementAndCharacterParity,
  runAutomatedQAPass,
} from "../lib/translation/qa-engine";

describe("QA Engine: Element Parity, Character Integrity & Critical Feedback", () => {
  const sampleSourceBlocks = [
    { id: "b1", text: "Skill - Reading Comprehension", box_2d: [45, 45, 68, 285] },
    { id: "b2", text: "Name: ___________________", box_2d: [45, 620, 68, 935] },
    { id: "b3", text: "A Day at the Beach", box_2d: [95, 240, 134, 665] },
    { id: "b4", text: "Story By: Judie Eberhardt", box_2d: [134, 280, 158, 625] },
    {
      id: "b5",
      text: "It was early summer, and the weather was really hot. Tyler's mom had told him that on Saturday they would be going to the beach.",
      box_2d: [174, 50, 204, 935],
    },
  ];

  it("passes with 100% fidelity when all text frames and characters are intact", () => {
    const perfectTargetBlocks = [
      { id: "b1", text: "المهارة - استيعاب القراءة", box_2d: [45, 45, 68, 285] },
      { id: "b2", text: "الاسم: ___________________", box_2d: [45, 620, 68, 935] },
      { id: "b3", text: "يوم على الشاطئ", box_2d: [95, 240, 134, 665] },
      { id: "b4", text: "قصة بقلم: جودي إيبرهاردت", box_2d: [134, 280, 158, 625] },
      {
        id: "b5",
        text: "كان ذلك في أوائل الصيف، وكان الطقس حاراً للغاية. أخبرت والدة تايلر إياه أنهم سيذهبون إلى الشاطئ يوم السبت.",
        box_2d: [174, 50, 204, 935],
      },
    ];

    const result = verifyElementAndCharacterParity({
      sourceBlocks: sampleSourceBlocks,
      targetBlocks: perfectTargetBlocks,
      sourceLang: "en",
      targetLang: "ar",
    });

    expect(result.passed).toBe(true);
    expect(result.elementCountMatches).toBe(true);
    expect(result.sourceBlockCount).toBe(5);
    expect(result.targetBlockCount).toBe(5);
    expect(result.missingBlockIds).toHaveLength(0);
    expect(result.clippedBlockIds).toHaveLength(0);
    expect(result.hasEllipsisTruncation).toBe(false);
    expect(result.issues).toHaveLength(0);
  });

  it("detects missing text frames and returns critical failure diagnostics", () => {
    // Only 3 of 5 blocks provided (b4 and b5 dropped)
    const incompleteTargetBlocks = [
      { id: "b1", text: "المهارة - استيعاب القراءة", box_2d: [45, 45, 68, 285] },
      { id: "b2", text: "الاسم: ___________________", box_2d: [45, 620, 68, 935] },
      { id: "b3", text: "يوم على الشاطئ", box_2d: [95, 240, 134, 665] },
    ];

    const result = verifyElementAndCharacterParity({
      sourceBlocks: sampleSourceBlocks,
      targetBlocks: incompleteTargetBlocks,
      sourceLang: "en",
      targetLang: "ar",
    });

    expect(result.passed).toBe(false);
    expect(result.elementCountMatches).toBe(false);
    expect(result.sourceBlockCount).toBe(5);
    expect(result.targetBlockCount).toBe(3);
    expect(result.missingBlockIds).toContain("b4");
    expect(result.missingBlockIds).toContain("b5");

    const criticalIssues = result.issues.filter((i) => i.severity === "critical");
    expect(criticalIssues.length).toBeGreaterThanOrEqual(2);
    expect(criticalIssues.some((i) => i.category === "text_frame_missing")).toBe(true);
  });

  it("detects ellipsis character clipping and artificial line cutoffs", () => {
    const clippedTargetBlocks = [
      { id: "b1", text: "المهارة - استيعاب القراءة", box_2d: [45, 45, 68, 285] },
      { id: "b2", text: "الاسم: ___________________", box_2d: [45, 620, 68, 935] },
      { id: "b3", text: "يوم على الشاطئ", box_2d: [95, 240, 134, 665] },
      { id: "b4", text: "قصة بقلم: جودي إيبرهاردت", box_2d: [134, 280, 158, 625] },
      {
        id: "b5",
        text: "كان ذلك في أوائل الصيف، وكان الطقس حاراً للغاية. أخبرت والدة تايلر إياه أنهم سيذهبون…", // Clipped with ellipsis!
        box_2d: [174, 50, 204, 935],
      },
    ];

    const result = verifyElementAndCharacterParity({
      sourceBlocks: sampleSourceBlocks,
      targetBlocks: clippedTargetBlocks,
      sourceLang: "en",
      targetLang: "ar",
    });

    expect(result.passed).toBe(false);
    expect(result.hasEllipsisTruncation).toBe(true);
    expect(result.clippedBlockIds).toContain("b5");

    const clippingIssue = result.issues.find((i) => i.category === "character_clipping");
    expect(clippingIssue).toBeDefined();
    expect(clippingIssue?.severity).toBe("critical");
    expect(clippingIssue?.description).toContain("ellipsis");
  });

  it("detects untranslated source blocks in target output", () => {
    const untranslatedBlocks = [
      { id: "b1", text: "المهارة - استيعاب القراءة", box_2d: [45, 45, 68, 285] },
      { id: "b2", text: "الاسم: ___________________", box_2d: [45, 620, 68, 935] },
      { id: "b3", text: "A Day at the Beach", box_2d: [95, 240, 134, 665] }, // Untranslated English!
      { id: "b4", text: "Story By: Judie Eberhardt", box_2d: [134, 280, 158, 625] }, // Untranslated English!
      {
        id: "b5",
        text: "كان ذلك في أوائل الصيف، وكان الطقس حاراً للغاية. أخبرت والدة تايلر إياه أنهم سيذهبون إلى الشاطئ يوم السبت.",
        box_2d: [174, 50, 204, 935],
      },
    ];

    const result = verifyElementAndCharacterParity({
      sourceBlocks: sampleSourceBlocks,
      targetBlocks: untranslatedBlocks,
      sourceLang: "en",
      targetLang: "ar",
    });

    expect(result.passed).toBe(false);
    expect(result.untranslatedBlockIds).toContain("b3");
    expect(result.untranslatedBlockIds).toContain("b4");

    const untranslatedIssue = result.issues.find((i) => i.category === "untranslated_content");
    expect(untranslatedIssue).toBeDefined();
    expect(untranslatedIssue?.severity).toBe("critical");
  });

  it("detects font glyph corruption and unescaped character artifacts", () => {
    const corruptBlocks = [
      { id: "b1", text: "المهارة - استيعاب القراءة", box_2d: [45, 45, 68, 285] },
      { id: "b2", text: "الاسم: ___________________", box_2d: [45, 620, 68, 935] },
      { id: "b3", text: "يوم على الشاطئ", box_2d: [95, 240, 134, 665] },
      { id: "b4", text: "قصة بقلم: جودي إيبرهاردت", box_2d: [134, 280, 158, 625] },
      {
        id: "b5",
        text: "كان ذلك في أوائل الصيف\uFFFD وكان الطقس ??? للغاية", // Corrupted glyphs
        box_2d: [174, 50, 204, 935],
      },
    ];

    const result = verifyElementAndCharacterParity({
      sourceBlocks: sampleSourceBlocks,
      targetBlocks: corruptBlocks,
      sourceLang: "en",
      targetLang: "ar",
    });

    expect(result.passed).toBe(false);
    const glyphIssue = result.issues.find((i) => i.category === "font_glyph_corruption");
    expect(glyphIssue).toBeDefined();
    expect(glyphIssue?.severity).toBe("critical");
  });

  it("integrates block-level parity verification directly into runAutomatedQAPass", async () => {
    const sourceText = sampleSourceBlocks.map((b) => b.text).join(" ");
    const partialTargetBlocks = [
      { id: "b1", text: "المهارة - استيعاب القراءة" },
      { id: "b2", text: "الاسم: ___________________" },
    ];
    const targetText = partialTargetBlocks.map((b) => b.text).join(" ");

    const qaReport = await runAutomatedQAPass({
      sourceText,
      targetText,
      sourceLang: "en",
      targetLang: "ar",
      sourceBlocks: sampleSourceBlocks,
      targetBlocks: partialTargetBlocks,
    });

    expect(qaReport.passed).toBe(false);
    expect(qaReport.metrics.sourceBlockCount).toBe(5);
    expect(qaReport.metrics.targetBlockCount).toBe(2);
    expect(qaReport.metrics.blocksMatched).toBe(false);
    expect(qaReport.metrics.missingBlocks.length).toBe(3);
    expect(qaReport.issues.some((i) => i.category === "text_frame_missing")).toBe(true);
    expect(qaReport.fidelityScore).toBeLessThan(70);
  });
});
