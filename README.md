# Ember Kitchen — restaurant ops

Dark kitchen: the guest orders from the storefront, the kitchen sees the ticket, the manager hands the order over. Payment on pickup.

## Happy path

1. Guest: `/menu` → cart → checkout (pickup).
2. Order code at `/order/{CODE}/track`.
3. The manager accepts the NEW order.
4. Kitchen: Start → Bump ready. SLA timer, 12 min = late.
5. The manager marks the order as handed over. The guest sees a full-screen "ready for pickup".

## Roles

| Role | Login | Scope |
|---|---|---|
| Manager | `manager@ember.local` / `1234` | shift, accept/hand over, 86, analytics, Z-report |
| Kitchen | `kitchen@ember.local` / `5678` | KDS + 86 |
| Admin | `admin@ember.local` / `9999` | menu, staff, shift printouts |

86: tap a dish on the board — it goes dark on the guest storefront without a page reload (1.2 s pulse).

## Stack

Next.js 16 · Prisma · Neon Postgres · Vercel.

The pulse endpoints `/api/public/pulse` and `/api/staff/pulse` are the source of truth for the live storefront and the KDS. SSE is kept as a fallback channel; on serverless we don't rely on it without a message bus.

## Run locally

```bash
cp .env.example .env
npm install
npx tsx scripts/apply-neon-schema.ts
npm run db:seed
npm run dev
```
