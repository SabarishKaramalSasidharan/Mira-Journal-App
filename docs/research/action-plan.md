# Mira — Action Plan: From Here to First Paying Customers

> **North star:** get Mira from "polished web app you're proud of" to "live on both stores, taking money, and past break-even" — with **minimum spend, maximum output**. Break-even is only **~15–20 paying subscribers**. Everything below is sequenced so you can literally do it in order and check it off.

_A do-this-next companion to the [launch & monetization strategy](./launch-monetization-strategy.md) (the backbone) and [competitor monetization](./competitor-monetization.md) (the numbers). All pricing, unit-economics, and break-even figures are reused from those docs — not re-derived. Grounded in a read of the current repo (`package.json`, `README.md`, `src/`) on Aug 2026; where a figure is a projection it is marked **(est.)**._

---

## At a glance

- **Where you are:** a genuinely good, feature-rich React 19 + TS + Vite + Tailwind **PWA**, live on GitHub Pages. Data is now durable (IndexedDB + export/import), there's a PIN lock, themes, voice, streaks, and AI follow-ups. The *product* is strong.
- **What's missing to make money:** it's still a **website**, not a store app. No native app-store presence, no accounts/sync, **no payments**, no analytics, no production LLM cost control, no privacy policy/terms.
- **The path:** 7 phases — finalize UX → make it trustworthy & measurable → wrap as real apps → wire the paywall → control AI cost → soft launch → public launch to break-even.
- **Total cost to get live:** **≈ $124–136 in year one** (Apple $99/yr + Google $25 once + optional ~$12 domain). Everything else runs on free tiers.
- **The finish line:** **~16–20 paying subs = break-even** (covers ~$40/mo infra). Then 500 subs ≈ **~$960/mo**, 3,000 ≈ **~$72K/yr** — reachable with **$0 paid acquisition**.
- **Realistic time to first revenue:** ~**6–10 focused weeks (est.)** solo, most of it in packaging and the paywall.

---

## 1. Where we are today

Legend: 🟢 built & solid · 🟡 partial / being decided · 🔴 missing (a gap to money).

### ✅ What's built (the product is real)

| Area | Status | What's true today |
| --- | :---: | --- |
| Conversational capture | 🟢 | One-tap mood → gentle one-question-at-a-time chat; type or WhatsApp-style voice input. |
| Mood + emotion selection | 🟢 | Hybrid mascot-face 1–5 selector + optional named-emotion tag. |
| AI follow-ups + weekly insight | 🟢 | Pluggable LLM (Gemini/Groq/Ollama, BYO key) with an **offline rule-based fallback** — works with zero setup. |
| Reflect page | 🟢 | Mood trend + theme charts (SVG, no deps). |
| Journal | 🟢 | Timeline with search/filters, entry detail, narrative notes. |
| Streaks | 🟢 | Non-punitive "show up" streak with a 7-day strip + milestones. |
| Data durability | 🟢 | **IndexedDB** primary + localStorage mirror + **JSON export/import backup**. The old data-loss risk is closed. |
| App lock | 🟢 | Hashed-PIN gate (SHA-256 + salt). |
| Polish | 🟢 | Splash screen, color themes, mascot, delight micro-interactions. |
| PWA | 🟢 | Installable via `vite-plugin-pwa`; live on GitHub Pages (`gh-pages` branch). |

### 🚧 Still being decided / shallow

| Area | Status | What to close |
| --- | :---: | --- |
| Feeling entry point | 🟡 | A Labs toggle ships **3 variants** — `pill` (A, default), `conversational` (B), `moodstep` (C). One needs to win. |
| Mood selector | 🟡 | Hybrid is shipped but the weather-scale A/B is still notionally open — lock it. |
| Accessibility | 🟡 | ARIA/focus exist; no formal contrast/screen-reader pass. |

### 🔴 The gaps between you and paying customers

| Gap | Why it blocks money |
| --- | --- |
| **No native app** | It's a PWA. Payments and store discovery require iOS/Android app-store presence → needs **Capacitor** wrapping. |
| **No payments / paywall** | No IAP, no tiers, no entitlement logic. Nothing to charge for yet. |
| **No analytics / crash visibility** | You'd launch blind on retention and bugs. |
| **No legal (privacy policy / terms)** | A hard blocker for store submission — both stores require them. |
| **No production LLM strategy** | BYO-key is fine for free users; hosted AI for Plus needs a server-side key + per-user caps to protect margin. |
| **No accounts / cloud sync** | Not needed to launch, but it's the headline **Plus** value. Add it *with* the paywall, not before. |

**Verdict:** you're not missing features — you're missing **packaging, trust, and a way to charge**. That's the whole job below.

---

## 2. The phased plan

```
Phase 1        Phase 2         Phase 3        Phase 4        Phase 5        Phase 6         Phase 7
Finalize UX →  Trust &      →  Package as  →  Wire the    →  Control AI  →  Soft launch →  Public launch
"coherent"     measurable      real apps      paywall        cost           (test)         → break-even
~3–5 days      ~3–5 days       ~1–2 weeks     ~1–2 weeks     ~2–3 days      ~1–2 weeks     ongoing
$0             $0              $124–136       $0             $0             $0             $0
```

---

### Phase 1 — Finalize the open UX & polish
**Goal (plain language):** stop experimenting and lock every "we're still deciding" toggle so the product feels like one confident, coherent app — not a lab.

**Steps:**
1. **Pick the feeling entry point.** Decide `conversational` (B) vs `moodstep` (C) vs keeping `pill` (A). Recommendation: ship whichever felt most natural in your own daily use; **B (conversational)** best fits the "talks back" wedge. Make it the default and demote the others to nothing (or keep A as a quiet fallback).
2. **Lock the mood selector.** Commit to the Hybrid mascot-face 1–5 + optional emotion tag; retire the weather-scale A/B thinking.
3. **Decide the Labs toggle's fate** — either remove the Settings toggle entirely, or keep it hidden. Users shouldn't see half-finished choices.
4. **Quick accessibility pass** — check color contrast (WCAG AA), tab order, and that the mood faces/emotion chips have screen-reader labels.
5. **Final polish sweep** — empty states, error copy, the completion moment, and dark-mode edge cases.

**Done when:** there are no user-visible "variant" choices left; a first-time user gets one clear, polished flow.
**Time:** ~3–5 days. **Cost:** **$0.**

---

### Phase 2 — Make it trustworthy & measurable
**Goal:** be able to *see* what's happening (retention, crashes) and satisfy the legal requirements both stores demand — all on free tiers.

**Steps:**
1. **Add privacy-friendly analytics (free tier).** PostHog free (or Firebase Analytics free). Track only what matters: install, first entry, D1/D7/D30 return, paywall view, purchase. No PII.
2. **Add crash/error visibility.** Firebase Crashlytics (free) or Sentry free tier + a React error boundary so a bug shows a friendly screen, not a white page.
3. **Write a privacy policy + terms.** Use a free generator; be honest that data is local-first. Host it free (GitHub Pages / your landing page). You'll also need this URL for the store listings.
4. **Prepare the store privacy answers** — draft answers for Apple's *App Privacy* and Google's *Data safety* forms now (even "we collect nothing" must be declared).

**Done when:** you can watch a live dashboard of installs/retention, crashes report to you, and the privacy policy + terms are on a public URL.
**Time:** ~3–5 days. **Cost:** **$0.**

---

### Phase 3 — Package as real apps (Capacitor)
**Goal:** turn the existing web build into genuine iOS + Android apps you can submit — **reusing this exact codebase**, not rewriting.

**Steps:**
1. **Add Capacitor.** `npm i @capacitor/core @capacitor/cli`, then `npx cap init`, `npx cap add ios`, `npx cap add android`; point it at your Vite `dist/`.
2. **Add 3 native features to clear Apple's Guideline 4.2** (the "repackaged website" rejection): **local/push notifications** (gentle daily reminder), **biometric unlock** (Face ID/Touch ID on top of your existing PIN), **haptics + safe-area handling**. List them explicitly in App Review notes.
3. **Pay the store fees:** enroll in the **Apple Developer Program ($99/yr)** and **Google Play Console ($25 one-time)**.
4. **Create store assets** (DIY, free): app icon (from `public/icon.svg`), screenshots that lead with the one-tap→conversation moment, and listing copy with ASO keywords (*journal, AI journal, private journal, mood tracker, gratitude*).
5. **Build & test on device** — `npx cap sync`, open in Xcode / Android Studio, run on a real phone.

**Done when:** signed iOS and Android builds run on real devices and are ready to upload.
**Time:** ~1–2 weeks (Xcode/signing is the slow part). **Cost:** **$99 + $25 (+ optional ~$12 domain) = ~$124–136.** _(This is the only real spend in the whole plan.)_

---

### Phase 4 — Wire monetization (the paywall)
**Goal:** be able to take money — free-forever core, Plus unlocks depth, with a paywall that appears at the *depth moment*, never on writing.

**Steps:**
1. **Set up billing.** Use **RevenueCat** (free under $2.5k/mo tracked revenue) over StoreKit (iOS) + Play Billing (Android). It handles receipts, entitlements, and trials cross-platform so you don't build billing yourself.
2. **Create the products** in App Store Connect + Play Console and map them in RevenueCat:
   - **Mira Plus Monthly — $4.99/mo**
   - **Mira Plus Annual — $39.99/yr, with a 14-day free trial** (the hero plan)
   - **Mira Plus Lifetime — $99.99 one-time**
3. **Gate depth, not writing.** Keep free: one-tap mood→conversation, offline follow-ups + BYO key, basic weekly reflection, charts, streaks, export/import. Put behind Plus: **cloud sync + encrypted backup, hosted AI (no key needed), long-term memory / "Ask Mira," richer weekly insight, extra icons/themes.**
4. **Place the paywall at the depth moment** — when a user reaches sync/backup or "Ask Mira" memory — not on the writing flow (paywalling writing caused a **60% drop-off** in the research).
5. **Add accounts + cloud sync** (Supabase auth + encrypted sync, free tier) as the flagship Plus feature — and ship an **in-app AND public web account-deletion** path the day you add auth (Google requires both).
6. **Enroll in Apple's Small Business Program** for the 15% commission tier.

**Done when:** a test user can start a trial, "buy" Plus in a sandbox, and unlock the gated features; entitlements persist across reinstall.
**Time:** ~1–2 weeks. **Cost:** **$0** (RevenueCat + Supabase free tiers).

---

### Phase 5 — Control LLM cost for production
**Goal:** make sure hosted AI for Plus users stays in **cents per user**, protecting the **~80% margin**.

**Steps:**
1. **Proxy hosted AI through a backend** (Supabase Edge Function → **Gemini Flash-Lite**) so the server key is never in the client (also fixes today's key-in-browser note).
2. **Keep it text-first and capped** — cap replies at ~120–150 output tokens; reserve voice/call mode for a later, clearly-costed add-on (voice is the real cost driver).
3. **Add per-user caps** — a soft monthly ceiling on hosted calls to stop runaway cost from a single heavy user.
4. **Keep free users free to you** — free tier stays on the offline engine or BYO key ($0 to you).

**Done when:** Plus AI runs server-side with a cap, and a heavy user's modeled cost is **single-digit cents/month (est.)** — comfortably under a $4.99 sub.
**Time:** ~2–3 days. **Cost:** **$0** now; hosted-AI PAYG (~$5–30/mo) only once paying users exist, and it's revenue-covered.

---

### Phase 6 — Soft launch (test before the world sees it)
**Goal:** find the embarrassing bugs and confusing moments with a small, friendly group before the public launch.

**Steps:**
1. **Ship to TestFlight (iOS) + Play internal testing (Android).**
2. **Recruit ~10–30 testers** — friends, r/Journaling, build-in-public followers.
3. **Watch the analytics** — where do people drop off? Does the trial start? Any crashes?
4. **Fix the top issues** and confirm the purchase/trial/restore flow works end-to-end on real accounts.

**Done when:** testers complete a full loop (write → reflect → hit the paywall → start a trial) with no blocking bugs, and you've fixed the top 3–5 pieces of feedback.
**Time:** ~1–2 weeks. **Cost:** **$0.**

---

### Phase 7 — Public launch → first revenue → break-even
**Goal:** go live, get the first paying customers, and cross break-even (~16–20 subs), all on **$0 paid acquisition**.

**Steps:**
1. **Submit to both stores** with completed App Privacy / Data-safety forms and the native features noted for Apple 4.2.
2. **Launch organically** — Product Hunt, value-first posts in r/Journaling / r/selfimprovement / r/privacy, short-form demos (TikTok/Reels/Shorts) of the one-tap→conversation moment, build-in-public on X/Threads/Indie Hackers.
3. **Lead with the $99.99 lifetime** as a launch cash accelerator (uniquely safe for Mira — a lifetime user costs only ~$3/yr to serve).
4. **Track toward break-even** — watch paying subs climb to **~16–20** (covers ~$40/mo infra = costs fully covered).
5. **Iterate on retention** (D1/D7/D30) and ASO; consider a **small** Apple Search Ads test **only after D30 retention is proven**.

**Done when:** the app is live on both stores, you have your first paying subscribers, and paying subs ≥ ~16–20 → **break-even**.
**Time:** ongoing. **Cost:** **$0** paid marketing (scale spend only from revenue).

---

## 3. Money map

**Pricing (Mira Plus — free-forever core, gate depth not writing):**

| Plan | Price | Notes |
| --- | --- | --- |
| Monthly | **$4.99/mo** | Entry point. |
| **Annual (hero)** | **$39.99/yr** | **14-day free trial**; ~60% under Rosebud/Mindsera. |
| Lifetime | **$99.99 once** | Launch cash accelerator; ~$3/yr to serve. |

**Unit economics one-liner:** with the 15% store cut and text-only Flash-Lite AI, each subscriber nets **~$3.99/mo** or **~$31/yr** at roughly **~80% margin** — because Mira's marginal AI cost is cents per user, not dollars.

**Break-even math (reused from the research):**
- Fixed cost, year 1: Apple $99 + Google $25 + domain $12 ≈ **$136**; ongoing infra ~**$40/mo** once traffic arrives.
- Break-even: ~$40/mo ÷ ~$2.6 net per annual sub ≈ **~16 subscribers** covers everything. Call it **~15–20 subs**.

**Revenue milestones (est., blended ~$27/payer/yr):**

| Paying subs | Est. monthly profit | Milestone |
| --- | --- | --- |
| ~20 | ~$5 | **Break-even** — costs covered |
| 100 | ~$165 | Self-sustaining hobby |
| 500 | ~$960 | Meaningful side income |
| 1,000 | ~$1,900 | Serious side business |
| 3,000 | ~$6,050 (~$72K/yr) | **Indie full-time viable** |

_Downloads needed (est., 3% freemium conversion): ~16,700 → 500 payers. A trial-led paywall (~5%+) roughly halves the traffic required._

---

## 4. Minimum-spend budget

**Principle: everything that *can* be $0 *is* $0.** The only unavoidable spend is the two store fees.

| Item | Cost | Recurring? |
| --- | --- | --- |
| Apple Developer Program | $99 | Yearly |
| Google Play Console | $25 | One-time |
| Domain (landing + privacy + deletion URL) | ~$12 | Yearly — **optional** (free subdomain works) |
| Backend (Supabase / Firebase free tier) | $0 | — |
| Billing (RevenueCat free < $2.5k/mo) | $0 | — |
| LLM (offline engine + BYO key; hosted PAYG later) | $0 | — |
| Analytics + crash reporting (PostHog / Firebase / Sentry free) | $0 | — |
| Landing page + privacy policy hosting (GitHub Pages) | $0 | — |
| Icons, screenshots, ASO, legal (DIY / free generators) | $0 | — |
| **Total minimum to launch (year 1)** | **≈ $124–136** | **≈ $111/yr thereafter** |

**Bottom line:** you can be **live on both stores for ~$124–136**, with **zero** ongoing infra or AI cost until paying users arrive to cover it.

---

## 5. First 2 weeks — do this next

A quick-start so you always know the very next action:

- [ ] **Pick the feeling entry point** (B vs C vs A) and make it the single default. *(Phase 1)*
- [ ] **Lock the mood selector** and hide/remove the Labs toggle. *(Phase 1)*
- [ ] **Run a quick accessibility pass** (contrast, labels, tab order). *(Phase 1)*
- [ ] **Add free analytics** (PostHog/Firebase) — track install, first entry, D1/D7. *(Phase 2)*
- [ ] **Add crash reporting + an error boundary.** *(Phase 2)*
- [ ] **Publish a privacy policy + terms** on a free URL. *(Phase 2)*
- [ ] **Enroll in Apple ($99) + Google ($25)** developer accounts (they take time to approve — start now). *(Phase 3)*
- [ ] **Add Capacitor** and get the app running on your own phone. *(Phase 3)*

That's the whole runway to "real app on my device." Payments come right after.

---

## 6. Top risks & how to de-risk cheaply

| Risk | Why it matters | De-risk (cheap) |
| --- | --- | --- |
| **Apple 4.2 rejection** (wrapped web app) | The most common WebView rejection. | Ship 3+ native features (push, biometric lock, haptics), native-feeling nav, offline handling; **list them in review notes**. *(Phase 3)* |
| **Nobody converts** | A generous free tier can cannibalize Plus. | Gate **depth** (sync, memory, hosted AI) not writing; surface the **14-day trial** at the depth moment; lead with lifetime at launch. |
| **AI cost creep** | Hosted AI at scale can bleed money. | Text-only, capped tokens, Flash-Lite, per-user caps, server-side proxy; free tier stays on offline/BYO ($0 to you). *(Phase 5)* |
| **Store compliance blocks you** | Missing legal/deletion halts submission. | Privacy policy + data-safety answers in Phase 2; in-app **and** web account-deletion the day you add auth. *(Phase 4)* |
| **Launch blind** | You can't fix what you can't see. | Analytics + crash reporting **before** launch, not after. *(Phase 2)* |
| **Crowded market** | Every feature exists elsewhere. | Lean on the wedge — "the private journal that talks back, in one tap, and never leaves your phone" — and ship **long-term memory**, the one real gap. |
| **Solo burnout / scope creep** | Easy to over-build before revenue. | Follow the phases in order; don't build sync until the paywall needs it; ship the smallest thing that can charge. |

---

## 7. Sources & prior art

- [Launch & monetization strategy](./launch-monetization-strategy.md) — the detailed backbone (readiness scorecard, Capacitor, Apple 4.2, phased roadmap).
- [How journaling apps make money — Mira's path to profitability](./competitor-monetization.md) — the numbers reused here (pricing, unit economics, break-even, milestones, conversion benchmarks).
- [Journaling apps in 2026 — where Mira fits](./journal-competitive-analysis.md) — differentiation and the retention playbook.
- Current repo state confirmed from `README.md`, `package.json`, and `src/` (IndexedDB storage, export/import, PIN lock, feeling-entry Labs toggle, hybrid mood selector) on Aug 2026.
