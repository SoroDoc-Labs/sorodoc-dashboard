# SoroDoc Dashboard Deployment Guide

This document describes how to deploy `sorodoc-dashboard` to production environments.

## Overview

`sorodoc-dashboard` is built on Next.js 16 (App Router) and can be deployed as:
1. **Static HTML/JS Export (SSG):** Suitable for zero-maintenance hosting on Cloudflare Pages, GitHub Pages, AWS S3 / CloudFront, or Netlify.
2. **Node.js Production Server:** Suitable for Docker, Vercel, Railway, or VPS deployments.

---

## Target 1: Static Export (Cloudflare Pages, Vercel, Netlify)

### 1. Build Static Export
```bash
npm ci
npm run build
```
Next.js outputs static HTML, CSS, client bundles, and assets into the `.next` / `out` directory.

### 2. Environment Variables
The dashboard is strictly client-side and read-only. No secret API keys or private keys are used or required:
- `NEXT_PUBLIC_DEFAULT_RPC_URL`: Optional fallback Soroban RPC endpoint (defaults to `https://soroban-testnet.stellar.org`).

---

## Target 2: Docker / Container Deployment

### Dockerfile
```dockerfile
# Multi-stage production build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Security & Deployment Checklist
- [x] Zero private keys / credentials required in build or runtime.
- [x] Read-only Soroban RPC ledger queries (no transaction submission or signing).
- [x] Input validation on contract address and RPC endpoint.
- [x] Maximum uploaded WASM binary file size capped at 15MB.
- [x] All 9 automated React Testing Library tests passing.
- [x] Strict TypeScript and Next.js production builds passing without errors.
