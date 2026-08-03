# Analyse App

Frontend Next.js for AI-generated image detection: upload media, run multi-model scan, manage subscription plans and usage quotas.

## Stack

- **Next.js 16** (App Router, Turbopack in dev)
- **React 19** + TypeScript
- **Clerk** — authentication & route protection
- **Stripe** — checkout + customer billing portal (via backend)
- **Centrifugo** — realtime events (scan completion, payment success/failure)
- **Tailwind CSS 4** + **shadcn/ui**
- **Sonner** — toasts

## Features

- Upload & analyse images (presigned upload → backend pipeline)
- Scan history + statistics dashboard
- Realtime updates over Centrifugo (`users:{userId}` channel)
- Pricing plans (monthly / annually) with Stripe Checkout
- Subscription page: plan, quota usage gauges, Stripe portal
- Payment success / cancel flows with auto-redirect

## Getting Started

### 1) Install

```bash
npm install
```

### 2) Environment

Copy `.env.dist` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/account/setup
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/account/setup
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:4000
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_CENTRIFUGO_URL=ws://localhost:8000/connection/websocket
```

| Variable | Role |
| --- | --- |
| `NEXT_PUBLIC_CLERK_*` / `CLERK_SECRET_KEY` | Clerk auth (sign-in → `/`, sign-up → `/account/setup`) |
| `NEXT_PUBLIC_BACKEND_API_URL` / `BACKEND_API_URL` | Backend API base URL (proxied by Next routes) |
| `NEXT_PUBLIC_CENTRIFUGO_URL` | WebSocket endpoint for realtime |

### 3) Run

```bash
npm run dev
```

App: [http://localhost:3001](http://localhost:3001)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port `3001` (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run format` | Prettier on `ts`/`tsx` |

## Pages

| Route | Description |
| --- | --- |
| `/` | Detector: upload + scan list + stats |
| `/pricing` | Plan selection → Stripe Checkout |
| `/subscription` | Current plan, quota usage, Stripe portal |
| `/subscription/success` | Post-checkout success (auto-redirect ~10s) |
| `/subscription/cancel` | Checkout cancelled / declined |

## Project Structure

```text
app/
  layout.tsx                 # Clerk, theme, nav, Toaster
  (private)/
    layout.tsx               # Providers + Centrifugo listener
    page.tsx                 # Home / detector
    pricing/page.tsx
    subscription/
      page.tsx               # Manage subscription
      success/page.tsx
      cancel/page.tsx
  api/                       # Auth-proxied routes → backend
    scans/
    medias/[id]/thumbnail/
    plans/
    realtime/connection/
    subscription/            # GET current subscription
    subscriptions/           # POST create checkout
    subscriptions/portal/    # POST Stripe portal session
    user/

components/
  page-hero.tsx              # Shared hero (badge + gradient title)
  pricing.tsx
  subscription-page.tsx
  payment-success.tsx
  payment-cancel.tsx
  upload-dropzone.tsx
  scan-item.tsx
  ui/                        # shadcn primitives

lib/
  scan/                  # Scans state (provider / api / types)
  plan/                      # Plans + pricing helpers
  subscription/              # Subscription state + Stripe helpers
  statistics/
  user/
  centrifugo/                # Token, channel, event listener
  require-auth.ts            # Server: Clerk session + token
  create-auth-headers.ts
```

## Auth & API proxy

`proxy.ts` protects non-public routes with Clerk (`auth.protect()`).

API routes under `app/api/**` follow the same pattern:

1. `requireAuth()` → Clerk token or `401`
2. Forward to `${BACKEND_API_URL}/api/...` with `Authorization: Bearer <token>`
3. On error: `{ success: false, data: <backend body> }` + status code
4. On success: return backend JSON as-is

## Realtime (Centrifugo)

`UserCentrifugeListener` (mounted in the private layout) subscribes to `users:{userId}` and reacts to:

| Event | Action |
| --- | --- |
| `scan_completed` | Refresh scans + statistics |
| `subscription_updated` | Refresh subscription |
| `payment_succeeded` | Refresh subscription + success toast |
| `payment_failed` | Refresh subscription + error toast |

Connection token: `GET /api/realtime/connection`.

## Subscription flow

1. User picks a plan on `/pricing` → `POST /api/subscriptions` → redirect to Stripe Checkout
2. Success URL → `/subscription/success` (short wait + redirect home; toast when Centrifugo fires)
3. Cancel URL → `/subscription/cancel`
4. Manage billing: `/subscription` → Stripe Customer Portal (`POST /api/subscriptions/portal`) when `stripeCustomerId` is set

## Theme

- `next-themes` (system / light / dark)
- Press `D` to toggle (ignored while typing in inputs)
