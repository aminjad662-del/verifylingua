import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";
import fs from "fs";
import { connect as shimConnect } from "../lib/shims/turbopack-hmr-shim";
import nextConfig from "../next.config";

describe("ChunkLoadError & Webpack Turbopack Shim Resilience", () => {
  it("turbopack-hmr-shim provides safe no-op connect interface for Next dev overlay", () => {
    expect(typeof shimConnect).toBe("function");

    const mockAddListener = vi.fn();
    const mockSendMessage = vi.fn();
    const mockOnError = vi.fn();

    expect(() => {
      shimConnect({
        addMessageListener: mockAddListener,
        sendMessage: mockSendMessage,
        onUpdateError: mockOnError,
      });
    }).not.toThrow();

    expect(mockAddListener).toHaveBeenCalled();
  });

  it("next.config.ts configures alias for Turbopack HMR client under Webpack", () => {
    expect(nextConfig.webpack).toBeDefined();

    const mockConfig: any = { resolve: { alias: {} } };
    const modified = (nextConfig as any).webpack(mockConfig, { dev: true, isServer: false });

    const aliasTarget =
      modified.resolve.alias[
        "@vercel/turbopack-ecmascript-runtime/browser/dev/hmr-client/hmr-client.ts"
      ];

    expect(aliasTarget).toBeDefined();
    expect(aliasTarget).toContain("turbopack-hmr-shim.js");
    expect(fs.existsSync(aliasTarget)).toBe(true);
  });

  it("scripts/patch-next.js exists and is runnable with resilient regex matching", () => {
    const patchScriptPath = path.resolve(__dirname, "../scripts/patch-next.js");
    expect(fs.existsSync(patchScriptPath)).toBe(true);

    const scriptContent = fs.readFileSync(patchScriptPath, "utf8");
    expect(scriptContent).toContain("process.env.TURBOPACK");
    expect(scriptContent).toContain("use-websocket.js");
    expect(scriptContent).toContain("patternA");
  });

  it("Next.js use-websocket.js contains TURBOPACK environment guard and catch handler", () => {
    const cjsPath = path.resolve(
      __dirname,
      "../node_modules/next/dist/client/components/react-dev-overlay/utils/use-websocket.js"
    );

    if (fs.existsSync(cjsPath)) {
      const content = fs.readFileSync(cjsPath, "utf8");
      // Must contain TURBOPACK guard in useTurbopack
      expect(content).toMatch(/!process\.env\.TURBOPACK/);
      // Must contain catch block on dynamic import
      expect(content).toContain(".catch(");
    }
  });

  it("error.tsx, global-error.tsx, and order/error.tsx exist to handle unhandled runtime errors", () => {
    const rootErrorPath = path.resolve(__dirname, "../app/error.tsx");
    const globalErrorPath = path.resolve(__dirname, "../app/global-error.tsx");
    const orderErrorPath = path.resolve(__dirname, "../app/order/error.tsx");

    expect(fs.existsSync(rootErrorPath)).toBe(true);
    expect(fs.existsSync(globalErrorPath)).toBe(true);
    expect(fs.existsSync(orderErrorPath)).toBe(true);

    const rootErrorContent = fs.readFileSync(rootErrorPath, "utf8");
    expect(rootErrorContent).toContain("ChunkLoadError");
    expect(rootErrorContent).toContain("window.location.reload");
    expect(rootErrorContent).not.toMatch(/#[0-9a-fA-F]{3,8}/); // No raw hex violations

    const globalErrorContent = fs.readFileSync(globalErrorPath, "utf8");
    expect(globalErrorContent).toContain("ChunkLoadError");
    expect(globalErrorContent).toContain("window.location.reload");
    expect(globalErrorContent).not.toMatch(/#[0-9a-fA-F]{3,8}/); // No raw hex violations

    const orderErrorContent = fs.readFileSync(orderErrorPath, "utf8");
    expect(orderErrorContent).toContain("ChunkLoadError");
    expect(orderErrorContent).toContain("window.location.reload");
    expect(orderErrorContent).not.toMatch(/#[0-9a-fA-F]{3,8}/); // No raw hex violations
  });

  it("scripts/build.js safely defaults memory to 2048MB preventing Windows pagefile exhaustion", () => {
    const buildScriptPath = path.resolve(__dirname, "../scripts/build.js");
    expect(fs.existsSync(buildScriptPath)).toBe(true);

    const buildContent = fs.readFileSync(buildScriptPath, "utf8");
    expect(buildContent).toContain("process.env.BUILD_MEMORY_MB || '2048'");
    expect(buildContent).not.toContain(": '4096'");
  });
});
