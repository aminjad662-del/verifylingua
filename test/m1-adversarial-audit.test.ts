import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Milestone M1 Adversarial Challenge: Hex Gate, Theme Lock & Token Integrity", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const HEX_REGEX = /#([0-9a-fA-F]{3,8})\b/g;

  // ─────────────────────────────────────────────────────────────
  // 1. check-raw-hex.js Regex & Scanner Stress Tests
  // ─────────────────────────────────────────────────────────────
  describe("1. check-raw-hex.js Scanner & Regex Stress Tests", () => {
    it("matches standard 3, 6, and 8 digit hex colors correctly", () => {
      const samples = [
        { text: "color: '#fff'", matched: ["#fff"] },
        { text: "color: '#FF5500'", matched: ["#FF5500"] },
        { text: "color: '#0c0d10'", matched: ["#0c0d10"] },
        { text: "color: '#FF550080'", matched: ["#FF550080"] },
        { text: "className='bg-[#FF5500]'", matched: ["#FF5500"] },
        { text: "className='bg-[#FF5500]/50'", matched: ["#FF5500"] },
        { text: "style={{ borderColor: '#E6E2D8' }}", matched: ["#E6E2D8"] },
      ];

      for (const sample of samples) {
        const matches = sample.text.match(HEX_REGEX);
        expect(matches).toEqual(sample.matched);
      }
    });

    it("empirically identifies regex and line-filtering bypass vectors", () => {
      // Vector A: Word boundary bypass with underscore in arbitrary Tailwind class
      // In JS regex, '_' is a \w character. So '#123456_' will NOT match '#123456' because '6' and '_' are both \w.
      const underscoreCase = "className='bg-[#123456_!important]'";
      const underscoreMatch = underscoreCase.match(HEX_REGEX);
      expect(underscoreMatch).toBeNull(); // Proves the bypass exists!

      // Vector B: Line starting with block comment prefix followed by active code
      const lineWithInlineBlockComment = "/* note */ const rawColor = '#FF0000';";
      const isSkippedByScanner =
        lineWithInlineBlockComment.trim().startsWith("//") ||
        lineWithInlineBlockComment.trim().startsWith("/*") ||
        lineWithInlineBlockComment.trim().startsWith("*");
      expect(isSkippedByScanner).toBe(true); // Proves the scanner skips lines that start with /* even if code follows!
    });

    it("confirms 0 raw hex colors exist in app/ and components/ (.tsx)", () => {
      const dirsToScan = ["app", "components"];
      const violations: { file: string; line: number; match: string }[] = [];

      function scan(dir: string) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scan(fullPath);
          } else if (entry.name.endsWith(".tsx")) {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");
            lines.forEach((line, index) => {
              if (
                line.trim().startsWith("//") ||
                line.trim().startsWith("/*") ||
                line.trim().startsWith("*")
              ) {
                return;
              }
              const matches = line.match(HEX_REGEX);
              if (matches) {
                for (const m of matches) {
                  violations.push({
                    file: path.relative(repoRoot, fullPath),
                    line: index + 1,
                    match: m,
                  });
                }
              }
            });
          }
        }
      }

      dirsToScan.forEach((d) => scan(path.join(repoRoot, d)));
      expect(violations).toEqual([]);
    });

    it("confirms check-raw-hex.js script has an empty allowlist", () => {
      const scriptPath = path.join(repoRoot, "scripts", "check-raw-hex.js");
      const scriptContent = fs.readFileSync(scriptPath, "utf8");
      expect(scriptContent).toContain("const ALLOWED_FILES = [];");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Theme Tokens & Global CSS Variable Completeness
  // ─────────────────────────────────────────────────────────────
  describe("2. Theme Tokens & Global CSS Variable Completeness", () => {
    const globalsCssPath = path.join(repoRoot, "app", "globals.css");
    const globalsCss = fs.readFileSync(globalsCssPath, "utf8");

    it("ensures no legacy electric cobalt (#3D57DB, #4361EE) or electric navy (#080A1F) in globals.css", () => {
      const bannedHex = [
        "#3D57DB",
        "#3d57db",
        "#4361EE",
        "#4361ee",
        "#080A1F",
        "#080a1f",
        "#1E293B",
        "#1e293b",
      ];
      for (const hex of bannedHex) {
        expect(globalsCss).not.toContain(hex);
      }
    });

    it("verifies warm ivory theme lock tokens in :root and .dark", () => {
      // Must contain warm ivory tokens
      expect(globalsCss).toContain("--canvas:           #FDFBF7;");
      expect(globalsCss).toContain("--canvas-subtle:    #F5F3EC;");
      expect(globalsCss).toContain("--surface:          #FAF8F3;");
      expect(globalsCss).toContain("--border:           #E6E2D8;");
      expect(globalsCss).toContain("--brand-ink:        #0C0D10;");
      expect(globalsCss).toContain("--signal-accent:        #FF5500;");

      // Verify .dark block mirrors warm ivory
      const darkBlockMatch = globalsCss.match(/\.dark\s*\{([\s\S]*?)\}/);
      expect(darkBlockMatch).not.toBeNull();
      const darkBlock = darkBlockMatch![1];

      expect(darkBlock).toContain("--canvas:           #FDFBF7;");
      expect(darkBlock).toContain("--surface:          #FAF8F3;");
      expect(darkBlock).toContain("--border:           #E6E2D8;");
      expect(darkBlock).toContain("--text:             #0C0D10;");
      expect(darkBlock).toContain("--brand-500:        #FF5500;");
      expect(darkBlock).toContain("--signal-accent:        #FF5500;");
    });

    it("verifies every @theme token referencing var(--token) is defined in :root", () => {
      const themeBlockMatch = globalsCss.match(/@theme\s*\{([\s\S]*?)\}/);
      expect(themeBlockMatch).not.toBeNull();
      const themeBlock = themeBlockMatch![1];

      // Extract all var(--xxx) references from @theme
      const varMatches = [...themeBlock.matchAll(/var\((--[a-zA-Z0-9_-]+)\)/g)];
      const referencedTokens = [...new Set(varMatches.map((m) => m[1]))];

      // Extract all defined tokens in :root
      const rootBlockMatch = globalsCss.match(/:root\s*\{([\s\S]*?)\}/);
      expect(rootBlockMatch).not.toBeNull();
      const rootBlock = rootBlockMatch![1];

      const missingInRoot: string[] = [];
      for (const token of referencedTokens) {
        if (token.startsWith("--font-") || token.startsWith("--r-")) continue;
        const tokenDefRegex = new RegExp(`${token}\\s*:`, "m");
        if (!tokenDefRegex.test(rootBlock)) {
          missingInRoot.push(token);
        }
      }

      expect(missingInRoot).toEqual([]);
    });

    it("verifies Emil Kowalski spring timing curve in globals.css", () => {
      expect(globalsCss).toContain("cubic-bezier(0.32, 0.72, 0, 1)");
      expect(globalsCss).toContain("button:active:not(:disabled)");
      expect(globalsCss).toContain("scale(0.98)");
      expect(globalsCss).toContain("prefers-reduced-motion: reduce");
    });

    it("verifies THEME_COLOR_LIGHT and THEME_COLOR_DARK in lib/theme-constants.ts are locked to warm ivory", () => {
      const constantsPath = path.join(repoRoot, "lib", "theme-constants.ts");
      const content = fs.readFileSync(constantsPath, "utf8");
      expect(content).toContain('export const THEME_COLOR_LIGHT = "#FDFBF7";');
      expect(content).toContain('export const THEME_COLOR_DARK = "#FDFBF7";');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Dark Mode Classes & Blue Leakage Audit Across Components
  // ─────────────────────────────────────────────────────────────
  describe("3. Dark Mode Class Audit Across Components", () => {
    it("verifies zero legacy dark mode blue/navy utility class leaks across components/", () => {
      const dirsToScan = ["components"];
      const bannedPatterns = [
        /dark:bg-blue-950/,
        /dark:text-blue-400/,
        /dark:border-blue-800/,
      ];

      const findings: { file: string; line: number; pattern: string }[] = [];

      function scan(dir: string) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scan(fullPath);
          } else if (entry.name.endsWith(".tsx")) {
            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");
            lines.forEach((line, index) => {
              for (const pat of bannedPatterns) {
                if (pat.test(line)) {
                  findings.push({
                    file: path.relative(repoRoot, fullPath),
                    line: index + 1,
                    pattern: pat.source,
                  });
                }
              }
            });
          }
        }
      }

      dirsToScan.forEach((d) => scan(path.join(repoRoot, d)));

      // Quality gate: zero dark blue / navy leaks across all components
      expect(findings).toEqual([]);
    });
  });
});
