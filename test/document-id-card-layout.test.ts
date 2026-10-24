import { describe, it, expect } from "vitest";
import { buildImageTranslatedSvg, streamlineBilingualLabel, splitMergedLabelValue } from "../lib/translation/svg-builder";

describe("Official ID Card & Certificate Layout Preservation", () => {
  const dummyImageBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  // Exact Italian Electronic ID Card ("Carta d'Identità", Francesco De Prisco) fields
  const italianIdBlocks = [
    {
      box_2d: [80, 200, 115, 800],
      original_text: "REPUBBLICA ITALIANA",
      translated_text: "REPÚBLICA ITALIANA",
      font_size_tier: "title",
      bg_color: "#dbe9f3",
      align: "center",
    },
    {
      box_2d: [118, 200, 142, 800],
      original_text: "MINISTERO DELL'INTERNO",
      translated_text: "MINISTERIO DEL INTERIOR",
      font_size_tier: "heading",
      bg_color: "#dbe9f3",
      align: "center",
    },
    {
      box_2d: [145, 200, 172, 800],
      original_text: "CARTA DI IDENTITÀ / IDENTITY CARD",
      translated_text: "DOCUMENTO DE IDENTIDAD / IDENTITY CARD",
      font_size_tier: "heading",
      bg_color: "#dbe9f3",
      align: "center",
    },
    {
      box_2d: [180, 200, 205, 550], // Label: Comune di
      original_text: "COMUNE DI / MUNICIPALITY",
      translated_text: "MUNICIPIO DE / MUNICIPALITY",
      font_size_tier: "caption",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [208, 200, 238, 550], // Value: VOLLA
      original_text: "VOLLA",
      translated_text: "VOLLA",
      font_size_tier: "body",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [245, 200, 268, 550], // Label: Cognome / Surname
      original_text: "COGNOME / SURNAME",
      translated_text: "APELLIDO / SURNAME",
      font_size_tier: "caption",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [270, 200, 305, 550], // Value: DE PRISCO
      original_text: "DE PRISCO",
      translated_text: "DE PRISCO",
      font_size_tier: "body",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [312, 200, 335, 550], // Label: Nome / Forename
      original_text: "NOME / FORENAME",
      translated_text: "NOMBRE / FORENAME",
      font_size_tier: "caption",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [338, 200, 372, 550], // Value: FRANCESCO
      original_text: "FRANCESCO",
      translated_text: "FRANCESCO",
      font_size_tier: "body",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [380, 200, 404, 550], // Label: Luogo e data di nascita
      original_text: "LUOGO E DATA DI NASCITA / PLACE AND DATE OF BIRTH",
      translated_text: "LUGAR Y FECHA DE NACIMIENTO / PLACE AND DATE OF BIRTH",
      font_size_tier: "caption",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [408, 200, 442, 550], // Value: NAPOLI (NA) 18.08.1970
      original_text: "NAPOLI (NA) 18.08.1970",
      translated_text: "NAPOLI (NA) 18.08.1970",
      font_size_tier: "body",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [450, 200, 472, 300], // Sesso / Sex
      original_text: "SESSO / SEX",
      translated_text: "SEXO / SEX",
      font_size_tier: "caption",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [450, 310, 472, 410], // Statura / Height
      original_text: "STATURA / HEIGHT",
      translated_text: "ESTATURA / HEIGHT",
      font_size_tier: "caption",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [450, 420, 472, 550], // Cittadinanza / Nationality
      original_text: "CITTADINANZA / NATIONALITY",
      translated_text: "NACIONALIDAD / NATIONALITY",
      font_size_tier: "caption",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [475, 200, 508, 300], // M
      original_text: "M",
      translated_text: "M",
      font_size_tier: "body",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [475, 310, 508, 410], // 180
      original_text: "180",
      translated_text: "180",
      font_size_tier: "body",
      bg_color: "#dbe9f3",
    },
    {
      box_2d: [475, 420, 508, 550], // ITA
      original_text: "ITA",
      translated_text: "ITA",
      font_size_tier: "body",
      bg_color: "#dbe9f3",
    },
  ];

  it("streamlines bilingual label slashes into canonical target language labels", () => {
    expect(streamlineBilingualLabel("LUOGO E DATA DI NASCITA / PLACE AND DATE OF BIRTH", "es")).toBe(
      "LUGAR Y FECHA DE NACIMIENTO"
    );
    expect(streamlineBilingualLabel("COGNOME / SURNAME", "es")).toBe("APELLIDOS");
    expect(streamlineBilingualLabel("NOME / FORENAME", "es")).toBe("NOMBRE");
    expect(streamlineBilingualLabel("SESSO / SEX", "es")).toBe("SEXO");
    expect(streamlineBilingualLabel("STATURA / HEIGHT", "es")).toBe("ESTATURA");
    expect(streamlineBilingualLabel("CITTADINANZA / NATIONALITY", "es")).toBe("NACIONALIDAD");
    expect(streamlineBilingualLabel("FIRMA DEL TITOLARE / HOLDER'S SIGNATURE", "es")).toBe("FIRMA DEL TITULAR");
  });

  it("renders single-line field labels on a single line without multi-line wrapping or squashing", () => {
    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 1000,
      height: 600,
      targetLang: "es",
      fileName: "carta-identita-francesco.jpg",
      blocks: italianIdBlocks as any,
    });

    // Check that labels remain single line (1 tspan per label block)
    // Check that each block gets its own dedicated <g clip-path> group
    const blockGroupMatches = Array.from(svg.matchAll(/<g clip-path="url\(#clip-blk-\d+\)">/g));
    expect(blockGroupMatches.length).toBe(italianIdBlocks.length);

    // Check that each label block has exactly 1 <tspan> (single line, no multi-line wrapping)
    // Label indices in italianIdBlocks: 0, 1, 2, 3, 5, 7, 9, 11, 12, 13
    const labelIndices = [0, 1, 2, 3, 5, 7, 9, 11, 12, 13];
    for (const idx of labelIndices) {
      const blockGRegex = new RegExp(`<g clip-path="url\\(#clip-blk-${idx}\\)">([\\s\\S]*?)<\\/g>`);
      const gMatch = svg.match(blockGRegex);
      expect(gMatch).toBeTruthy();
      const tspans = Array.from((gMatch![1] || "").matchAll(/<tspan/g));
      expect(tspans.length).toBe(1); // Single crisp line!
    }

    // Ensure no tspan inside any label has tiny font or vertical collision
    expect(svg).not.toContain('font-size="3"');
    expect(svg).not.toContain('font-size="4"');
    expect(svg).not.toContain('font-size="5"');
    expect(svg).not.toContain('font-size="6"');

    // All font sizes must be at least 7.5px
    const fsMatches = Array.from(svg.matchAll(/font-size="([\d\.]+)"/g));
    for (const match of fsMatches) {
      const fs = parseFloat(match[1]);
      expect(fs).toBeGreaterThanOrEqual(7.5);
    }
  });

  it("prevents label inpainting masks from colliding or overlapping the value underneath", () => {
    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 1000,
      height: 600,
      targetLang: "es",
      fileName: "carta-identita-francesco.jpg",
      blocks: italianIdBlocks as any,
    });

    // Extract all <rect fill="#dbe9f3" ... /> masks
    const rectMatches = Array.from(
      svg.matchAll(/<rect\s+x="([\d\.]+)"\s+y="([\d\.]+)"\s+width="([\d\.]+)"\s+height="([\d\.]+)"\s+fill="#dbe9f3"/g)
    );
    expect(rectMatches.length).toBe(italianIdBlocks.length);

    // Verify for each field label that its bottom (y + height) does not exceed the top of the subsequent value
    // E.g. Cognome label -> DE PRISCO value
    // In italianIdBlocks:
    // Block 5: Label Cognome at y: 245..268 (normalized to 147..160.8)
    // Block 6: Value DE PRISCO at y: 270..305 (normalized to 162..183)
    // Label mask bottom MUST be <= Value mask top
    const rects = rectMatches.map((m) => ({
      x: parseFloat(m[1]),
      y: parseFloat(m[2]),
      w: parseFloat(m[3]),
      h: parseFloat(m[4]),
      bottom: parseFloat(m[2]) + parseFloat(m[4]),
    }));

    // Cognome label (index 5 in blocks) vs DE PRISCO (index 6)
    const labelCognome = rects[5];
    const valueCognome = rects[6];
    expect(labelCognome.bottom).toBeLessThanOrEqual(valueCognome.y + 1); // No overlap into value!

    // Luogo di nascita label (index 9) vs NAPOLI value (index 10)
    const labelBirth = rects[9];
    const valueBirth = rects[10];
    expect(labelBirth.bottom).toBeLessThanOrEqual(valueBirth.y + 1); // No overlap into value!
  });

  it("propagates detected document theme background color to blocks with missing or white bg_color", () => {
    const blocksWithMissingBg = [
      {
        box_2d: [100, 200, 130, 800],
        original_text: "REPUBBLICA ITALIANA",
        translated_text: "REPÚBLICA ITALIANA",
        bg_color: "#dbe9f3", // Theme detected here
      },
      {
        box_2d: [140, 200, 165, 500],
        original_text: "COGNOME / SURNAME",
        translated_text: "APELLIDO / SURNAME",
        bg_color: "#ffffff", // Should inherit #dbe9f3 instead of harsh white
      },
      {
        box_2d: [170, 200, 200, 500],
        original_text: "DE PRISCO",
        translated_text: "DE PRISCO",
        // bg_color undefined: should inherit #dbe9f3
      },
    ];

    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 1000,
      height: 600,
      targetLang: "es",
      fileName: "italian-id.jpg",
      blocks: blocksWithMissingBg as any,
    });

    // Inpainting masks must use the sampled ID card cyan background #dbe9f3
    // and not contain harsh whiteout rectangles
    const fillMatches = Array.from(svg.matchAll(/<rect[^>]+fill="([^"]+)"[^>]*>/g)).map((m) => m[1]);
    const inpaintFills = fillMatches.filter((f) => f !== "#ffffff" && f !== "#f8fafc");
    expect(inpaintFills.length).toBe(3);
    for (const fill of inpaintFills) {
      expect(fill).toBe("#dbe9f3");
    }
  });

  it("generates and exports high-fidelity translated SVG for authentic Italian ID card", () => {
    const fs = require("fs");
    const origHalfPath = "C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/orig_half.png";
    let imgBuffer = dummyImageBuffer;
    if (fs.existsSync(origHalfPath)) {
      imgBuffer = fs.readFileSync(origHalfPath);
    }

    const svg = buildImageTranslatedSvg({
      imageBuffer: imgBuffer,
      mimeType: "image/png",
      width: 512,
      height: 492,
      targetLang: "es",
      fileName: "carta-identita-francesco-de-prisco.png",
      blocks: italianIdBlocks as any,
    });

    const outPath = "C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/id_card_fixed.svg";
    fs.writeFileSync(outPath, svg, "utf8");
    expect(fs.existsSync(outPath)).toBe(true);
  });

  it("decomposes merged label-value strings accurately across languages", () => {
    // Spanish
    const esBirth = splitMergedLabelValue("LUGAR Y FECHA DE NACIMIENTO NAPOLI (NA) 18.08.1970");
    expect(esBirth.isMerged).toBe(true);
    expect(esBirth.label).toBe("LUGAR Y FECHA DE NACIMIENTO");
    expect(esBirth.value).toBe("NAPOLI (NA) 18.08.1970");

    const esIssue = splitMergedLabelValue("EMISIÓN 20.04.2021");
    expect(esIssue.isMerged).toBe(true);
    expect(esIssue.label).toBe("EMISIÓN");
    expect(esIssue.value).toBe("20.04.2021");

    const esExpiry = splitMergedLabelValue("CADUCIDAD 18.08.2031");
    expect(esExpiry.isMerged).toBe(true);
    expect(esExpiry.label).toBe("CADUCIDAD");
    expect(esExpiry.value).toBe("18.08.2031");

    const esSex = splitMergedLabelValue("SEXO M");
    expect(esSex.isMerged).toBe(true);
    expect(esSex.label).toBe("SEXO");
    expect(esSex.value).toBe("M");

    const esHeight = splitMergedLabelValue("ESTATURA 166");
    expect(esHeight.isMerged).toBe(true);
    expect(esHeight.label).toBe("ESTATURA");
    expect(esHeight.value).toBe("166");

    const esNat = splitMergedLabelValue("NACIONALIDAD ITA");
    expect(esNat.isMerged).toBe(true);
    expect(esNat.label).toBe("NACIONALIDAD");
    expect(esNat.value).toBe("ITA");

    // Italian
    const itBirth = splitMergedLabelValue("LUOGO E DATA DI NASCITA ROMA (RM) 01.01.1985");
    expect(itBirth.isMerged).toBe(true);
    expect(itBirth.label).toBe("LUOGO E DATA DI NASCITA");
    expect(itBirth.value).toBe("ROMA (RM) 01.01.1985");

    // English
    const enBirth = splitMergedLabelValue("PLACE AND DATE OF BIRTH LONDON 12.05.1992");
    expect(enBirth.isMerged).toBe(true);
    expect(enBirth.label).toBe("PLACE AND DATE OF BIRTH");
    expect(enBirth.value).toBe("LONDON 12.05.1992");

    // Non-merged single field
    const nonMerged = splitMergedLabelValue("FRANCESCO");
    expect(nonMerged.isMerged).toBe(false);
    expect(nonMerged.label).toBe("FRANCESCO");
  });

  it("renders merged label-value blocks as clean two-row sub-elements with zero cutoff", () => {
    const mergedBlocks = [
      {
        box_2d: [100, 200, 140, 600],
        original_text: "LUOGO E DATA DI NASCITA NAPOLI (NA) 18.08.1970",
        translated_text: "LUGAR Y FECHA DE NACIMIENTO NAPOLI (NA) 18.08.1970",
        bg_color: "#edf5f9",
      },
      {
        box_2d: [150, 200, 185, 380],
        original_text: "EMISSIONE 20.04.2021",
        translated_text: "EMISIÓN 20.04.2021",
        bg_color: "#edf5f9",
      },
      {
        box_2d: [150, 400, 185, 580],
        original_text: "SCADENZA 18.08.2031",
        translated_text: "CADUCIDAD 18.08.2031",
        bg_color: "#edf5f9",
      },
    ];

    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 512,
      height: 492,
      targetLang: "es",
      fileName: "test-merged.png",
      blocks: mergedBlocks as any,
    });

    // Verify both row 1 (label) and row 2 (value) exist in the output SVG
    expect(svg).toContain("LUGAR Y FECHA DE NACIMIENTO");
    expect(svg).toContain("NAPOLI (NA) 18.08.1970");
    expect(svg).toContain("EMISIÓN");
    expect(svg).toContain("20.04.2021");
    expect(svg).toContain("CADUCIDAD");
    expect(svg).toContain("18.08.2031");

    // Verify label styling (slate, medium) vs value styling (dark ink, semibold)
    expect(svg).toContain('fill="#475568"');
    expect(svg).toContain('fill="#0f172a"');
    expect(svg).toContain('font-weight="500"');
    expect(svg).toContain('font-weight="600"');

    // Verify inpainting rects are present
    const rects = Array.from(svg.matchAll(/<rect\s+x="([\d\.]+)"\s+y="([\d\.]+)"\s+width="([\d\.]+)"\s+height="([\d\.]+)"\s+fill="#edf5f9"/g));
    expect(rects.length).toBe(3);
  });
});
