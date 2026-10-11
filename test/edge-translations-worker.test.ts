import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");

describe("Cloudflare Pages Edge Worker - Translation & Tracking Endpoints", () => {
  const workerJsPath = path.join(DIST_DIR, "_worker.js");

  it("verifies dist/_worker.js contains all translation and certified tracking endpoints", () => {
    expect(fs.existsSync(workerJsPath)).toBe(true);
    const workerContent = fs.readFileSync(workerJsPath, "utf8");

    // Route matching checks
    expect(workerContent).toContain("pathname === '/api/translations/request'");
    expect(workerContent).toContain("pathname.startsWith('/api/translations/')");
    expect(workerContent).toContain("pathname === '/api/translations/approve'");
    expect(workerContent).toContain("pathname.includes('/api/jobs/') && pathname.endsWith('/review')");
    expect(workerContent).toContain("pathname.includes('/download')");
    expect(workerContent).toContain("pathname.endsWith('/status')");
  });

  it("verifies translation jobs query both translation_jobs and orders tables", () => {
    const workerContent = fs.readFileSync(workerJsPath, "utf8");
    expect(workerContent).toContain("/rest/v1/translation_jobs");
    expect(workerContent).toContain("/rest/v1/orders");
  });

  it("verifies certified translations support pending_review and approved states", () => {
    const workerContent = fs.readFileSync(workerJsPath, "utf8");
    expect(workerContent).toContain("pending_review");
    expect(workerContent).toContain("approved");
    expect(workerContent).toContain("isOfficiallyCertified");
    expect(workerContent).toContain("Official sworn affidavit and certified seal minted");
  });
});
