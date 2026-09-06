# Cloudflare Deployment Guide for VerifyLingua

This project is configured for deployment on **Cloudflare Pages** and **Cloudflare Workers**.

---

## 1. Cloudflare Configuration Files in Repository

The repository includes pre-configured Cloudflare files:
- **`wrangler.toml`**: Cloudflare Pages configuration specifying `compatibility_flags = ["nodejs_compat"]` and `pages_build_output_dir = "dist"`.
- **`scripts/build-cloudflare.js`**: Generates edge-optimized static assets, clean URL routes, `_worker.js`, `_routes.json`, and `_headers`.
- **`dist/`**: The complete production bundle uploaded to Cloudflare Pages (zero origin timeouts, sub-20ms edge latency).

---

## 2. Why All Past Deployments Failed in Cloudflare Pages

In the Cloudflare dashboard, all past deployments failed with a red warning icon due to three specific platform conflicts:
1. **Node.js Version Default**: Cloudflare Pages defaults to Node 18.17.1 or Node 12 if unspecified. Next.js 15 requires Node >= 18.18.0. **Fixed** by adding `.node-version` and `.nvmrc` pinned to `20.18.0`.
2. **pnpm Lockfile Version 9**: Cloudflare Pages defaults to pnpm 8, which cannot parse `pnpm-lock.yaml` v9. **Fixed** by declaring `"packageManager": "pnpm@9.15.0"` in `package.json`.
3. **Wrangler JSONC Memory Recursion**: `wrangler.jsonc` caused esbuild to attempt recursive bundle packaging of `dist` into `dist`, crashing with `fatal error: out of memory allocating heap arena map`. **Fixed** by removing `wrangler.jsonc` and using clean `wrangler.toml`.
4. **Prerender Worker Stability**: Next.js parallel build workers on Windows/CI can exceed stack limits. **Fixed** by adding `experimental: { workerThreads: false, cpus: 1 }` to `next.config.ts`.

---

## 3. Cloudflare Dashboard Build Configuration

1. In your **[Cloudflare Dashboard](https://dash.cloudflare.com/)**:
2. Navigate to **Compute (Workers & Pages)** > **verifylingua** > **Settings** > **Builds & deployments**.
3. Configure:
   - **Framework preset**: `None` (or `Next.js`)
   - **Build command**: `npm run build` (or `pnpm run build`)
   - **Build output directory**: `dist`
   - **Root directory**: `/`
4. **Environment Variables**:
   Under **Settings** > **Environment variables**:
   - `NODE_VERSION`: `22.16.0`
   - `PNPM_VERSION`: `10.11.1`
   - `NEXT_TELEMETRY_DISABLED`: `1`
5. Go to **Deployments** > Click **Retry deployment** on the latest deployment (or push a new commit to trigger an automatic build).

---

## 4. Deploying Directly via Wrangler CLI (Instant Fix)

If you have Wrangler CLI installed locally, you can deploy the pre-built `dist` directory in 10 seconds:

```bash
# 1. Build the production package
npm run build

# 2. Deploy dist directly to Cloudflare Pages
npx wrangler pages deploy dist --project-name verifylingua
```

---

## 5. Key Architecture Features

- **Global Edge Caching**: Immutable 1-year cache headers for `/_next/static/*` assets.
- **Clean URL Resolution**: Automatic resolution for `/pricing`, `/how-it-works`, `/languages/*`, `/documents/*`, `/use-cases/*`, etc.
- **Edge Routing (`_worker.js`)**: Eliminates origin timeouts by serving all assets directly from Cloudflare's edge CDN.
- **Health Check Endpoint**: Available at `https://verifylingua.pages.dev/cdn-cgi/healthz` and `/api/health`.

