/**
 * Webpack shim for Turbopack HMR client.
 *
 * In Next.js 15 dev mode with Webpack, the React dev overlay's `useTurbopack` hook
 * dynamically imports `@vercel/turbopack-ecmascript-runtime/browser/dev/hmr-client/hmr-client.ts`.
 * When running with Webpack, Turbopack is not active, but Webpack compiles an async chunk
 * with a 100+ character path which can fail to load on Windows or during HMR reconnects,
 * causing ChunkLoadError.
 *
 * This shim resolves the dynamic import safely and immediately with a no-op connect function.
 */

export function connect(options) {
  if (options && typeof options.addMessageListener === "function") {
    options.addMessageListener(() => {});
  }
}

const turbopackShim = { connect };
export default turbopackShim;
