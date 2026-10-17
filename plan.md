# BootPulse implementation plan

## Product approach

BootPulse will be delivered as a desktop-first React workspace with a polished fictional demo state. The MVP prioritizes the founder workflow from the brief: review runway, understand the arithmetic, edit cash-flow inputs, compare a decision scenario, and capture follow-up work. The existing Vite/React starter and Manus runtime will be preserved so the project remains previewable and deployable.

The first implementation pass uses an in-memory fictional demo store in the client so every core interaction is immediately usable in Preview. The domain model is kept explicit in typed objects and pure calculation helpers inside the UI layer; this makes the formulas visible and keeps the code ready for a later database/API wiring pass. No banking, payroll, tax, AI, media upload, or multi-currency features are introduced.

## Design direction

### Alternatives considered

- **Editorial finance desk** — 0.07 probability: warm paper surfaces, strong rules, restrained ink typography.
- **Signal console** — 0.05 probability: dark canvas, luminous metrics, dense operator controls.
- **Calm cash cockpit** — 0.08 probability: deep navy shell, mint signal color, coral risk accents, and spacious dashboard cards.

### Chosen movement: Calm cash cockpit

BootPulse should feel like a trustworthy financial instrument rather than a generic SaaS admin panel. The interface uses a deep navy rail as the anchor, pale blue-gray workspace surfaces for quiet reading, and a bright mint signal color for healthy movement. Coral and amber are reserved for risk states and decision tradeoffs. A compact display face is used for metrics while a humanist sans-serif carries explanatory copy.

**Core principles:** transparent arithmetic, calm hierarchy, decision-ready context, and keyboard-friendly density.

**Color philosophy:** navy conveys stability and focus; mint signals positive cash movement; coral/amber make risk legible without relying on color alone; off-white surfaces keep long tables comfortable to scan.

**Layout paradigm:** a fixed navigation rail opens into a wide content canvas. Key numbers sit in a compact hero band, followed by a two-column reading flow that keeps the next decision visible beside the supporting data.

**Signature elements:** the mint vertical pulse mark in the wordmark, small uppercase section labels, and formula callouts that expose the arithmetic instead of hiding it.

**Interaction philosophy:** edits should feel like spreadsheet edits but with guardrails. Inline values commit with Enter, cancel with Escape, and use native focus styles. Important warnings always include a text label and icon.

**Animation:** only short, low-amplitude fades and value transitions; respect reduced-motion preferences and never animate financial values in a way that suggests hidden calculation.

**Typography:** use the system sans stack for durable rendering with a compact metric style for numbers. Labels are 11px uppercase with letter spacing; body copy is 14–16px with generous line height.

**Brand essence:** a cash-flow cockpit for founders who want to see the math before they make the move — calm, candid, practical.

**Brand voice:** direct, specific, and non-alarmist. Example lines: “Know which month needs a decision.” and “Every figure is editable. Every total has a trail.”

**Wordmark:** a narrow mint pulse glyph sits inside a rounded navy square immediately before the BootPulse wordmark.

**Signature brand color:** pulse mint `#8FF0C4`.

## Project structure

- `client/src/App.tsx`: route map, shared shell, typed demo state, calculation helpers, and MVP pages.
- `client/src/index.css`: design tokens, responsive behavior, focus treatment, table/chart styling, and reduced-motion rules.
- `client/public/manus-routes.json`: route manifest for Preview and publication.
- `plan.md`: implementation/design decisions.
- `TODO.md`: acceptance-oriented delivery checklist.

## Build workflow

1. Replace the starter home page with marketing and app routes.
2. Add demo data and pure runway calculations.
3. Add editable cash-flow and scenario interactions.
4. Add decision, milestone, notes, pricing, settings, and legal surfaces.
5. Run typecheck/build, start Preview, verify the route manifest and inspect the rendered landing and workspace routes.
6. Commit the implementation to the project repository when checks pass.
