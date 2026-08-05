# Mira Research Archive

Archived research reports for **Mira**, the journaling app. Each report distills an interactive Cursor canvas into a readable, versioned Markdown document (verdicts, data tables, competitor comparisons, ratings, roadmaps, and citations).

## Reports

- **[Journaling apps in 2026 — where Mira fits](./journal-competitive-analysis.md)** — Market sizing, a full feature matrix against 7 rivals (Rosebud, Day One, Apple Journal, Daylio, Reflection, Mindsera, How We Feel), where each competitor wins/loses, a positioning strategy, and a retention playbook. Verdict: compete on **positioning and retention**, not features; Mira's only real gap is long-term memory, its edge is on-device privacy.
- **[Mira brand color — cut the picker, own the teal](./brand-color-strategy.md)** — Competitive color landscape, hue-crowding analysis, color psychology, and a rating of the 6 shipped palettes. Verdict: **cut the theme picker** and commit to "Mira Teal" (`#0e9e8c` light / `#2dd4bf` dark), including light/dark tokens and WCAG AA notes.
- **[What more can Mira's Reflect tab do?](./reflect-tab-ideas.md)** — 19 ideas across three tiers (Quick / Medium / Ambitious) on an effort-vs-impact map, with per-idea value/data/effort/risk tables and a recommended 5-item build order. Guardrail: deepen the calm "mirror," don't build a dashboard.
- **[Mira's completion moment — reflect back, don't applaud](./completion-moment.md)** — A critique of the "Saved!" modal, how 7 apps handle the completion moment, six design options, a before→after concept, and a celebrate-vs-quiet trigger rule. Verdict: default to a non-blocking **reflect-back close** and gate confetti to milestones.
- **[Mira — launch & monetization strategy](./launch-monetization-strategy.md)** — An honest readiness scorecard (14 dimensions), the leanest path to the App Store & Google Play (Capacitor wrap + Apple 4.2 workaround), a phased roadmap (harden → store MVP → monetize → grow), a freemium model (**Mira Plus $4.99/mo · $39.99/yr · $99.99 lifetime**), and a lean budget with a **~$124–136 minimum-to-launch** total. Verdict: it's a polished prototype, not a shippable product — fix durability, trust, and packaging, and gate depth not writing.

## `canvases/`

The [`canvases/`](./canvases) folder holds the **original Cursor canvas sources** (`*.canvas.tsx`) that these reports were generated from, preserved verbatim. They import from `cursor/canvas` and are only meant to run inside Cursor's canvas host — they are intentionally excluded from the app's TypeScript build and lint (see the repo's `tsconfig.app.json` include and `.oxlintrc.json` ignore patterns).
