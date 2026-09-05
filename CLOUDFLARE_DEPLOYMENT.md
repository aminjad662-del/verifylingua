# Cloudflare Deployment Guide for VerifyLingua

This project is configured for deployment on **Cloudflare Pages** and **Cloudflare Workers**.

---

## 1. Cloudflare Configuration Files in Repository

The repository includes pre-configured Cloudflare files:
- **`wrangler.toml`**: Cloudflare Pages configuration specifying `compatibility_flags = ["nodejs_compat"]` and `pages_build_output_dir = ".open-next"`.
- **`wrangler.jsonc`**: Cloudflare Workers configuration with assets binding and Node.js compatibility.
- **`open-next.config.ts`**: OpenNext adapter configuration for Cloudflare.
- **`next.config.ts`**: Configured with `images.unoptimized = true` for Cloudflare CDN compatibility.

---

## 2. Deploying via Cloudflare Dashboard (Recommended)

1. Log into your **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. Navigate to **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
3. Select the repository: **`aminjad662-del/verifylingua`**.
4. Configure the build settings:
   - **Project name**: `verifylingua`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js` (or `None`)
   - **Build command**: `prisma generate && next build`
   - **Build output directory**: `.open-next` (or `.next`)
5. **Environment Variables**:
   Under **Settings** > **Environment variables**, add:
   - `NODE_VERSION`: `22.16.0`
   - `PNPM_VERSION`: `10.11.1`
   - `NEXT_TELEMETRY_DISABLED`: `1`
   - `DATABASE_URL`: `<your-postgresql-url>`
6. Click **Save and Deploy**.

---

## 3. Deploying via Wrangler CLI

You can also deploy directly from your local terminal:

```bash
# 1. Log in to Cloudflare
npx wrangler login

# 2. Build the project
npm run build

# 3. Deploy to Cloudflare Pages
npx wrangler pages deploy .open-next --project-name verifylingua
```

---

## 4. Key Runtime Notes

- **Node.js Compatibility**: `compatibility_flags = ["nodejs_compat"]` is enabled in `wrangler.toml` to support Next.js 15 server runtime.
- **Database (Prisma)**: Ensure `DATABASE_URL` is set in your Cloudflare environment variables pointing to your hosted PostgreSQL database (e.g., Supabase, Neon, AWS RDS, or Prisma Postgres).
