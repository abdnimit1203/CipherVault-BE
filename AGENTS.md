# CipherVault-BE — Deployment Notes for AI Agents

This project deploys to **Vercel** using **zero-config Express support**
(https://vercel.com/docs/frameworks/backend/express). Read this before touching
`vercel.json`, the deployment config, or anything under `api/`.

## Deployment model — do not reintroduce `vercel.json` or an `api/` folder

- Vercel auto-detects the Express app from `src/index.ts` (which does
  `export default app`). This is zero-config: **no `vercel.json`, no `api/`
  wrapper file, no manual `builds`/`routes` array.**
- The Vercel dashboard's "Framework Preset" should be **Express**.
- If `/` or `/api/*` starts 404ing on every route, the first thing to check is
  whether a `vercel.json` with a `builds` array has been reintroduced — that
  forces Vercel down the old legacy `@vercel/node` builder path instead of its
  native Express handling, and if it points at a path that isn't actually
  committed (e.g. a gitignored `dist/` build), every route 404s because zero
  functions get produced.
- Do not commit compiled `.js` output next to `.ts` source files (e.g.
  `src/index.js` alongside `src/index.ts`). This happened once already from an
  in-place `tsc` run and got committed — `src/**/*.js` is now gitignored to
  prevent it recurring. A stray `.js` sibling risks a bundler/resolver picking
  the stale compiled file instead of the current TypeScript source.

## Known landmine: `jose` / `jwks-rsa` ESM crash

`firebase-admin` pulls in `jwks-rsa`, which depends on `jose@^6.x`. `jose` v6
dropped CommonJS support entirely (pure ESM). `jwks-rsa`'s code does
`require('jose')`, which crashes on Vercel's Node runtime with:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module .../node_modules/jose/dist/webapi/index.js
from .../node_modules/jwks-rsa/src/utils.js not supported.
```

This **only reproduces in deployment**, not locally — newer local Node
versions (22+) can transparently `require()` ESM, masking the bug in dev.

**Fix already applied**: `package.json` has an `overrides` entry pinning
`jose` to `5.10.0` (last major with a working CJS `require` export condition).
Do not remove this override or bump `jose` without confirming the new version
still ships a `require` condition in its `exports` map (`npm view jose@<version>`
or inspect `node_modules/jose/package.json`), and re-verify `jwks-rsa`'s two
call sites (`jose.importJWK`, `jose.exportSPKI`) still work.

## TypeScript version

Keep `typescript` on a stable `5.x` release. TS 7 (the native/Go-rewritten
compiler) is too new for some of the tooling this project touches and caused
a build crash (`Cannot read properties of undefined (reading 'readFile')`)
under the older manual `@vercel/node` builder path. Even though deployment no
longer goes through that path, there's no reason to be on a bleeding-edge TS
major here.

## JWT_SECRET has no fallback — it must be set

`src/config/jwtSecret.ts` throws at import time if `JWT_SECRET` is unset. This
is intentional: an earlier version of this code fell back to a hardcoded
string (`ciphervault_super_secret_jwt_key_30d`) when the env var was missing,
which is a real vulnerability once that string is public in git history —
anyone could forge valid session JWTs with it. Do not reintroduce a fallback.
Set a long random `JWT_SECRET` in every environment (local `.env`, Vercel
Production + Preview).

## Required environment variables (names only — see your own `.env` for values)

`MONGO_URI`, `JWT_SECRET`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
`FIREBASE_PRIVATE_KEY`, `FRONTEND_URL`, `NODE_ENV`. Not needed on Vercel:
`PORT`, `VERCEL` (Vercel sets `VERCEL` itself).

`FIREBASE_CLIENT_EMAIL` must look like
`xxx@<project>.iam.gserviceaccount.com` — if it's a 40-char hex string
instead, that's actually the `private_key_id` field from the service account
JSON, misplaced. Get the real value from Firebase Console → Project Settings
→ Service Accounts.

## `public/` is served as static CDN assets

Never put logs, exports, or anything sensitive in `public/` — Vercel's
zero-config Express serves everything under `public/**` directly and
publicly. This already happened once with a downloaded log-export CSV.

## Live URLs

- Backend: https://abd-cipher-vault-be.vercel.app/ (all routes under `/api/*`
  — e.g. `/api/health`, `/api/auth/*`, `/api/vault/*`)
- Frontend: https://abd-ciphervault.netlify.app
