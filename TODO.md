# BootPulse MVP TODO

## Core product shell

- [ ] Desktop-first BootPulse workspace uses a fixed sidebar with Dashboard, Cash Flow, Scenarios, Decisions, Milestones, Notes, Settings, and Billing destinations.
- [ ] Landing page explains the runway promise, shows value props and a primary “Start free trial” CTA; pricing page includes Starter, Growth, and Scale tiers.
- [ ] Legal privacy and terms pages state the fictional-demo-data boundary and third-party data handling.
- [ ] Route manifest includes marketing, auth, onboarding, workspace, billing, settings, and export paths.

## Transparent cash-flow workflow

- [ ] Dashboard shows current cash, monthly revenue, monthly costs, net burn, estimated runway, projected zero-cash month, threshold warning, and recent activity.
- [ ] Every displayed financial summary exposes a plain-language formula disclosure with the inputs and expression used.
- [ ] Cash-flow table uses semantic table markup, sticky header/first column, totals, horizontal table scrolling, and rows for opening cash, revenue, expenses, net cash flow, and closing cash.
- [ ] Cash-flow cells support inline edit with Enter to commit and Escape to revert; the runway summary recalculates immediately.
- [ ] The cash-flow view includes CSV export and an explicit read-only upgrade callout for months beyond the active horizon.

## Scenario and narrative planning

- [ ] Scenario comparison shows baseline plus scenarios, runway delta, zero-cash month, and closing cash at horizon.
- [ ] Scenario detail supports assumption types add expense, remove expense, change revenue, one-off cost, and one-off gain with start/end months and enabled state.
- [ ] Decision log shows reverse-chronological decisions with linked scenario, impact, and status.
- [ ] Milestone view presents planned, achieved, and missed milestones on a horizontal timeline with text labels.
- [ ] Notes view supports business, month, and decision context in the UI.

## Trust, access, and responsive behavior

- [ ] Fictional demo data is clearly labelled and contains no real customer financial data.
- [ ] Warning severity is communicated by icon plus text, not color alone.
- [ ] Focusable controls have visible focus rings; reduced-motion preferences are respected; color contrast remains readable.
- [ ] At narrower widths the workspace surfaces a read-only planning notice rather than exposing editing controls.
- [ ] Typecheck, production build, and Preview route checks pass before delivery.
