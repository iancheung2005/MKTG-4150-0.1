# BootPulse

BootPulse is a desktop-first cash-flow, runway, and scenario-planning dashboard for founders and bootstrapped teams.

This repository contains the React / Express / tRPC / Drizzle starter adapted for the BootPulse MVP. The current delivery includes the landing page, pricing, auth and onboarding surfaces, workspace shell, runway dashboard, editable cash-flow table, scenario comparison, decisions, milestones, notes, billing, and settings views. Demo data is fictional.

## Live demo

The published BootPulse app is available at [bootpulse-8pdjnpyk.manus.space](https://bootpulse-8pdjnpyk.manus.space).

## Development

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

The project preserves the Webdev starter runtime. Platform login, storage, payments, and service contracts live in the shared capability references. Private keys stay server-side, and managed `/manus-storage/` assets remain platform-owned.

## Project documents

- `docs/PRD.md.pdf` — BootPulse product requirements document.
- `docs/tasklist.md.pdf` — Phase 1 MVP execution plan and verification gates.
- `plan.md` — implementation and design plan for this delivery.
- `TODO.md` — outcome-oriented MVP checklist.
