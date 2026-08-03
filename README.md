# Menoly

A customer retention platform for ecommerce stores. Menoly scores customers using RFM analysis (Recency, Frequency, Monetary value), automatically flags at-risk customers, and sends win-back email campaigns through an event-driven background job pipeline.

## How it works

1. Customer order data is analyzed using RFM scoring
2. Customers who were previously valuable but have gone quiet are flagged
3. A background job queue (BullMQ + Redis) picks up flagged customers
4. Win-back emails are sent automatically via Resend
5. Campaign status updates flow back to the dashboard in real time

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Queue:** Redis + BullMQ
- **Email:** Resend
- **Styling:** Tailwind CSS

## Running locally

```bash
docker compose up -d
npm install
npx prisma migrate dev
npx tsx -r dotenv/config prisma/seed.ts
npm run dev
```

Run the background worker in a separate terminal:

```bash
npx tsx -r dotenv/config lib/queue/winback-worker.ts
```
Thank you!
