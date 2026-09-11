import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT_DIR = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");

describe("Cloudflare Pages Edge & Static Prerender Distribution Gate", () => {
  const customerRoutes = [
    { path: "index.html", label: "Root Landing Page (/)" },
    { path: path.join("pricing", "index.html"), label: "Pricing Page (/pricing)" },
    { path: path.join("how-it-works", "index.html"), label: "How It Works (/how-it-works)" },
    { path: path.join("order", "triage", "index.html"), label: "Order Triage (/order/triage)" },
    { path: path.join("order", "configure", "index.html"), label: "Order Configure (/order/configure)" },
    { path: path.join("order", "checkout", "index.html"), label: "Order Checkout (/order/checkout)" },
    { path: path.join("order", "VL-DEMO1", "index.html"), label: "Order Tracking (/order/VL-DEMO1)" },
    { path: path.join("order", "VL-DEMO1", "proof", "index.html"), label: "Proofing Studio (/order/VL-DEMO1/proof)" },
    { path: path.join("verify", "VL-CERT-8921", "index.html"), label: "Public Certificate (/verify/VL-CERT-8921)" },
    { path: path.join("dashboard", "index.html"), label: "Client Dashboard (/dashboard)" },
  ];

  it("ensures all 10 customer-facing routes exist as compiled static HTML in dist/", () => {
    expect(fs.existsSync(DIST_DIR)).toBe(true);

    for (const route of customerRoutes) {
      const fullPath = path.join(DIST_DIR, route.path);
      expect(fs.existsSync(fullPath), `Missing static file: ${route.path} for ${route.label}`).toBe(true);
      const content = fs.readFileSync(fullPath, "utf8");
      expect(content.length).toBeGreaterThan(500);
      expect(content).toContain("<!DOCTYPE html>");
      expect(content).toContain("VerifyLingua");
    }
  });

  it("ensures Cloudflare Pages edge configuration files exist in dist/", () => {
    const workerJs = path.join(DIST_DIR, "_worker.js");
    const headersFile = path.join(DIST_DIR, "_headers");
    const routesJson = path.join(DIST_DIR, "_routes.json");

    expect(fs.existsSync(workerJs), "dist/_worker.js must exist").toBe(true);
    expect(fs.existsSync(headersFile), "dist/_headers must exist").toBe(true);
    expect(fs.existsSync(routesJson), "dist/_routes.json must exist").toBe(true);

    const workerContent = fs.readFileSync(workerJs, "utf8");
    expect(workerContent).toContain("export default");
    expect(workerContent).toContain("handleApiRequest");
    expect(workerContent).toContain("/cdn-cgi/healthz");
    expect(workerContent).toContain("/order/VL-DEMO1/proof");

    const routesParsed = JSON.parse(fs.readFileSync(routesJson, "utf8"));
    expect(routesParsed.version).toBe(1);
    expect(routesParsed.include).toContain("/*");

    const headersContent = fs.readFileSync(headersFile, "utf8");
    expect(headersContent).toContain("Cache-Control");
    expect(headersContent).toContain("X-Content-Type-Options: nosniff");
  });

  it("ensures fallback mirrors are synchronized across .open-next and out", () => {
    const openNextDir = path.join(ROOT_DIR, ".open-next");
    const outDir = path.join(ROOT_DIR, "out");

    expect(fs.existsSync(openNextDir), ".open-next directory must exist").toBe(true);
    expect(fs.existsSync(outDir), "out directory must exist").toBe(true);

    expect(fs.existsSync(path.join(openNextDir, "index.html"))).toBe(true);
    expect(fs.existsSync(path.join(outDir, "index.html"))).toBe(true);
  });
});
