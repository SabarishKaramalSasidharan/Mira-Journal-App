# Mira — Launch & Monetization Strategy

> How to take Mira from a polished single-device prototype to a high-quality, money-making app on the Apple App Store and Google Play — with **minimum spend and maximum output**. Builds directly on the [competitive analysis](./journal-competitive-analysis.md) (positioning, pricing, retention) and the product as it actually exists in this repo.

_Compiled Aug 2026. Grounded in a read of the repo (`package.json`, `vite.config.ts`, `index.html`, `src/lib/storage.ts`, `src/lib/llm.ts`, `src/lib/ai.ts`, components) and current store/tooling research. Sources linked at the bottom._

---

## TL;DR

- **Stage:** A **late-stage, high-quality prototype** — feature-complete and beautifully designed, but a **single-device web app** with no durability, accounts, sync, legal, analytics, or store packaging. It is a demo you can be proud of, **not yet a shippable product**.
- **Leanest path to stores:** Keep the existing React/Vite/PWA code and **wrap it with [Capacitor](https://capacitorjs.com/)** into iOS + Android native shells. Add ~3 native features (reminders/push, biometric lock, haptics) to clear Apple's **Guideline 4.2**.
- **Strategy:** Own the wedge the incumbents can't copy — **"the private journal that talks back, in one tap, and never leaves your phone."** Ship the one real gap (long-term memory), gate depth, keep core free.
- **Monetization:** Freemium subscription — **Mira Plus at $4.99/mo, $39.99/yr (7-day trial), $99.99 lifetime**. Free forever core; Plus unlocks sync/backup, hosted AI (no key needed), long-term memory, voice.
- **Budget:** **Minimum to launch ≈ $124–136 (year one)** — Apple $99/yr + Google $25 one-time + optional $12 domain. Backend, LLM, design, and ASO all **$0** via free tiers, BYO-key, and DIY.

---

## 1. Current stage — honest readiness assessment

Mira is a **genuinely well-built prototype**. The signature experience — tap a mood and it *instantly* becomes a gentle, one-question-at-a-time conversation — works, looks great, and runs fully offline via a rule-based engine, with an optional pluggable LLM (Gemini free tier / Groq / Ollama) when the user brings a key. It is a PWA today (`vite-plugin-pwa` with a real manifest + Workbox precache; `index.html` already carries the `apple-mobile-web-app` tags).

But everything that makes an app *shippable and trustworthy* is missing. All data lives in a single `localStorage` key (`mira.entries.v1`) — clearing the browser, switching devices, or reinstalling **loses the entire journal**. There is no account, no sync, no backup/export, no analytics/crash reporting, no tests, no privacy policy, and no native store packaging. The LLM key is stored in the browser (the code itself notes production should proxy through a backend).

**Verdict:** Pre-alpha as a *product*, even though it's near-complete as a *prototype*. The gap to a quality store launch is not features — it's **durability, trust, and packaging**.

### Product readiness scorecard

Legend: **Strong** = launch-ready · **Partial** = present but shallow/at-risk · **Gap** = blocking, must build.

| # | Dimension | Rating | The gap / what's true today |
| --- | --- | :---: | --- |
| 1 | Core UX & signature loop | **Strong** | One-tap mood → conversation, offline AI follow-ups, weekly reflection, themes, mood charts (7/30/90/all), streaks, voice capture — all shipped and polished. |
| 2 | Visual & interaction polish | **Strong** | Brand, mascot, light/dark/system themes, researched "completion moment," non-punitive milestone celebration. Design is a real asset. |
| 3 | Offline capability | **Strong** | Rule-based engine works with zero setup; PWA Workbox precache. Rare strength vs. cloud-only rivals. |
| 4 | **Data persistence & durability** | **Gap** | `localStorage` only. No export/import. Clearing cache / reinstall / new device = **total data loss**. Highest-risk gap. |
| 5 | Accounts & identity | **Gap** | No auth. Needed for sync + subscriptions. |
| 6 | Cross-device sync & backup | **Gap** | None. The #2 objection ("what if I lose it") is wide open. |
| 7 | Privacy & AI trust model | **Partial** | Local-first is a genuine edge, but the BYO key sits in the browser and hosted AI has no proxy. No privacy policy. |
| 8 | Accessibility | **Partial** | ARIA labels and focus handling exist; no formal audit (contrast, screen-reader, tab order). |
| 9 | Testing / QA | **Gap** | No test suite at all. |
| 10 | Analytics & crash reporting | **Gap** | No instrumentation — you'd launch blind on retention and crashes. |
| 11 | Legal & compliance | **Gap** | No privacy policy, no App Privacy / Data-safety answers, no account-deletion path. Hard blockers for submission. |
| 12 | Store packaging | **Gap** | PWA-ready but no native shell, store icons, screenshots, or listings. |
| 13 | Monetization infrastructure | **Gap** | No IAP, paywall, tiers, or entitlement logic. |
| 14 | Native features for Apple 4.2 | **Gap** | No push, biometric lock, or haptics — needed to avoid the "repackaged website" rejection. |

---

## 2. Next steps — the leanest path to a high-quality store launch

### 2.1 Packaging: wrap the web app, don't rebuild it

Mira is already a Vite/React PWA, so the cheapest, highest-leverage move is to **reuse the exact web build** inside a native shell rather than rewrite anything.

| Option | What it is | Fit for Mira | Requirements |
| --- | --- | --- | --- |
| **Capacitor** _(Recommended)_ | Ionic's native shell that hosts your `dist/` in a WebView and exposes native APIs (push, biometrics, haptics, filesystem) via plugins. You keep real Xcode/Android Studio projects. | **Best fit.** Keeps the entire codebase; adds exactly the native hooks needed for 4.2; live-reload dev loop; also still ships as a PWA. | A **Mac + Xcode** for iOS builds; **Android Studio** for Android; `npm i @capacitor/core @capacitor/cli`, `npx cap add ios/android`, `npx cap sync`. |
| **PWABuilder** | Microsoft wizard: point it at your PWA URL, get store packages. Android via **TWA**, iOS via a **Capacitor**-based Xcode project under the hood. | Fine as a shortcut, but iOS still routes through Capacitor — so you may as well own the Capacitor project directly for the native features you need. | Same Mac/Xcode requirement for iOS; a hosted PWA URL. |
| **Trusted Web Activity (TWA)** | Android-only: Chrome renders your PWA full-screen from Play. | Good enough for Android alone, but gives you **no iOS path** and fewer native hooks. Use only if Android-first. | Android Studio / Bubblewrap; a hosted HTTPS PWA + Digital Asset Links. |

**Recommendation: Capacitor for both platforms.** One codebase → iOS + Android + PWA, with the native plugin bridge that also solves Apple 4.2. ([Capacitor](https://capacitorjs.com/), [2026 PWA/Capacitor deep-dive](https://www.youngju.dev/blog/culture/2026-05-16-pwa-service-workers-2026-workbox-vite-pwa-capacitor-twa-ios-web-push-deep-dive.en), [Capacitor + React 2026 guide](https://noqta.tn/en/tutorials/capacitor-react-mobile-app-ios-android-2026))

### 2.2 Store requirements & costs

| Item | Cost | Notes |
| --- | --- | --- |
| Apple Developer Program | **$99 / year** (recurring) | Required to distribute on the App Store; includes TestFlight. ([Apple](https://developer.apple.com/programs/)) |
| Google Play Developer | **$25 one-time** | Lifetime Play Console access. ([comparison](https://appscreenshotstudio.com/blog/play-store-vs-app-store-key-differences-indie-devs-2026)) |
| Privacy policy + App Privacy / Data-safety forms | $0 | Both stores require a public privacy policy and a completed privacy questionnaire — even if you collect nothing. ([Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469)) |
| Account-deletion path (only if you add accounts) | $0 | Google requires **both** an in-app delete AND a public HTTPS deletion URL for any app with account creation. Build it the day you add auth. ([Play account deletion](https://support.google.com/googleplay/android-developer/answer/13327111)) |
| Apple Small Business Program | — | Opt in → **15%** commission (vs 30%) while under $1M/yr. ([Apple SBP](https://developer.apple.com/app-store/small-business-program/)) |

**Commission reality:** Under $1M/yr you pay **15%** on Apple (Small Business Program) and **15%** on Google (dropping toward 10–20% after the June 2026 Epic settlement). Price with a 15% cut assumed. ([rates](https://appscreenshotstudio.com/blog/play-store-vs-app-store-key-differences-indie-devs-2026))

### 2.3 The Apple 4.2 gotcha (wrapped-web-app rejection) — and how to dodge it

Apple's **Guideline 4.2 (Minimum Functionality)** rejects apps that are "just a repackaged website." The fix is well-documented: ship **3+ genuine native features**, make navigation feel native, handle offline gracefully, and **list the native features in the App Review notes**. ([Apple guidelines](https://developer.apple.com/app-store/review/guidelines/), [4.2 fix guide](https://code2native.com/blog/fix-app-store-rejection-42-webview))

Mira already has offline support and a native-feeling bottom tab bar. Adding these three via Capacitor plugins clears the bar comfortably:

1. **Local + push notifications** — gentle daily journaling reminders (the single most persuasive 4.2 signal).
2. **Biometric app lock (Face ID / Touch ID)** — perfectly on-brand for a private journal.
3. **Haptics + proper safe-area/status-bar handling** — small touches that read as "real app."

### 2.4 Backend & persistence on a budget

Keep Mira **local-first** (cheapest, most private, and it's your positioning). Add cloud **only** as an optional, Premium-gated layer for sync/backup + accounts.

| Option | Free tier | Best for | Watch-outs |
| --- | --- | --- | --- |
| **Supabase** _(Recommended for DB + auth)_ | 500 MB Postgres, **50k MAU auth**, unlimited API requests, 1 GB storage | Relational data, email/OAuth auth, row-level security, encrypted sync | Free projects **pause after 7 days idle** (cold start); a weekly ping avoids it. Pro is $25/mo when you have real traffic. ([pricing](https://supabase.com/pricing)) |
| **Firebase (Spark)** | 1 GB Firestore, ~50k reads/20k writes/day, **free Crashlytics + Analytics + FCM push** | Best-in-class **offline sync**, crash reporting, analytics, push | Daily op caps; Cloud Storage now needs Blaze. ([pricing](https://firebase.google.com/pricing)) |

**Recommended split:** Supabase for **auth + encrypted sync/backup**, and Firebase's **free Crashlytics + Analytics + FCM** (or [PostHog](https://posthog.com/pricing) free) for instrumentation and push — all $0 at launch scale.

### 2.5 LLM cost model — keep founder cost near zero

The offline rule-based engine means **the free tier costs you nothing**, and free users who want smarter replies can bring their own Gemini/Groq key (stays on device). Only **hosted** AI (where you pay) is reserved for Premium.

| Tier | AI engine | Who pays | Founder cost |
| --- | --- | --- | --- |
| **Free** | Offline rule-based engine (+ optional BYO key) | User (or nobody) | **$0** |
| **Plus** | Hosted **Gemini Flash-Lite / Flash** via a backend proxy | You — but covered by subscription | Cents/user/month |

Gemini Flash-Lite is **$0.10 / $0.40** per 1M input/output tokens; Flash is **$0.30 / $2.50**. Mira caps replies at ~120 output tokens, so a heavy user's monthly hosted-AI cost is **single-digit cents** — trivially covered by a $4.99 subscriber. Route hosted calls through a **Supabase Edge Function** so the server key is never in the client (this also fixes the current key-in-browser issue). ([Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing))

### 2.6 Monetization model (refined from the competitive analysis)

**Benchmarks (2026):**

| App | Free | Paid | AI gating |
| --- | --- | --- | --- |
| Day One | Yes | Silver **$49.99/yr**, Gold **$74.99/yr** (annual only) | All AI in Gold |
| Rosebud | 2 prompts/day | ~**$13/mo** | Core product is the AI |
| Mindsera | Very limited | ~**$15/mo** | AI-first |
| Stoic | Basic | Premium **$39.99/yr** / **$6.99/mo**; +AI **$99.99/yr**; Lifetime **$199.99** | AI is an add-on |
| Reflectly | Limited | ~**$59.99/yr** / **$9.99/mo** | — |
| Daylio | Yes (ads) | ~**$35.99/yr** / **$4.99/mo** | No AI |

_Sources: [Day One plans](https://dayoneapp.com/plans/), [best journaling apps 2026](https://architectapp.ai/blog/best-journaling-apps-2026)._

**Recommended model — freemium subscription, "Mira Plus":**

- **Free forever:** the full signature experience — one-tap mood → conversation, offline AI follow-ups, basic weekly reflection, mood charts, streaks, local export/import. (Never paywall basic writing — that caused a **60% drop-off** in the competitive analysis.)
- **Mira Plus** — **$4.99/mo · $39.99/yr (~33% off, the hero plan) · $99.99 lifetime**, with a **7-day free trial** on annual. Deliberately undercuts Rosebud ($13) and Mindsera ($15), and beats Day One's AI-only-in-$74.99-Gold.

| Capability | Free | Mira Plus |
| --- | :---: | :---: |
| One-tap mood → conversation | ✅ | ✅ |
| Offline AI follow-ups + BYO key | ✅ | ✅ |
| Basic weekly reflection, charts, streaks | ✅ | ✅ |
| Local export / import (data safety) | ✅ | ✅ |
| **Cloud sync + encrypted backup (multi-device)** | — | ✅ |
| **Hosted AI — smart replies, no key needed** | — | ✅ |
| **Long-term memory / "Ask Mira"** (the #1 differentiator) | — | ✅ |
| **Voice transcription, richer weekly insight** | — | ✅ |
| Extra app icons / themes | — | ✅ |

**Why this converts:** the habit forms free (retention first), and the paywall sits on *depth + peace-of-mind* (memory, sync, backup) — not on the act of writing. A realistic free→paid of **~5–8%** applies once the habit lands.

### 2.7 ASO + launch on ~$0 marketing

- **ASO first:** title/subtitle + keywords around *journal, AI journal, private journal, mood tracker, gratitude, self-reflection*; screenshots that lead with the **one-tap → conversation** moment; a crisp "never leaves your phone" privacy line.
- **Organic channels (free):** a **Product Hunt** launch; value-first posts in **r/Journaling, r/selfimprovement, r/getdisciplined, r/privacy**; **TikTok / IG Reels / YouTube Shorts** demoing the talk-back moment; **build-in-public** on X/Threads and **Indie Hackers**.
- **Landing page:** free host (GitHub Pages / Vercel / Netlify) doubling as the **privacy policy + account-deletion URL** home and an email waitlist.
- **Paid UA:** **not worth it early.** Don't spend on ads until D7/D30 retention is proven; then a small Apple Search Ads test only.

---

## 3. Phased roadmap

```
Phase 0 — Harden        Phase 1 — Store MVP        Phase 2 — Monetize        Phase 3 — Grow
(local-first, ~1–2 wk)  (Capacitor, ~2–4 wk)       (accounts+IAP, ~3–5 wk)   (ongoing)
data won't be lost  →   it's a real native app  →  it makes money        →   it grows
```

### Phase 0 — Harden (make data safe, still no backend) · cost ~$0
- Migrate `localStorage` → **IndexedDB**; add **JSON export/import** (kills the data-loss objection immediately).
- Add **error boundaries**, a minimal **analytics** (PostHog free) + **crash reporting** (Firebase Crashlytics free).
- Soften the streak model to be fully **non-punitive**; run a quick **accessibility** pass (contrast, tab order, screen-reader labels).
- Publish a **privacy policy + terms** (free generator) on a simple landing page.

### Phase 1 — Store launch MVP (native, local-first) · cost = Apple $99 + Google $25 (+ ~$12 domain)
- **Capacitor** wrap for iOS + Android; add **push/local reminders, biometric lock, haptics, safe-area** (clears 4.2).
- App **icons, splash, screenshots**, store listings + **ASO**; complete **App Privacy** + **Data-safety** forms.
- **TestFlight / Play internal testing**, then submit. Ship **without accounts** — pure local-first, fastest path to "live."

### Phase 2 — Monetize · cost = free tiers; hosted-AI PAYG covered by revenue
- **Supabase auth** + **encrypted cloud sync/backup** (with in-app **and** web **account-deletion** from day one).
- **[RevenueCat](https://www.revenuecat.com/) + IAP** paywall (free up to $2.5k/mo tracked revenue), Free vs Plus entitlements, **7-day trial**.
- **Hosted AI proxy** (Supabase Edge Function → Gemini Flash-Lite) so Plus needs no key; ship **"Ask Mira" long-term memory** — the one real competitive gap.
- Enroll in the **Small Business Program** (15%).

### Phase 3 — Grow · cost ~$0 (scale only with revenue)
- Product Hunt + Reddit + short-form content; iterate ASO; add **share/referral**.
- Retention experiments on **D1/D7/D30**; home-screen **widget**; mine the [reflect-tab ideas](./reflect-tab-ideas.md) for depth.
- Consider a **small** paid UA test only after D30 retention is proven.

---

## 4. Lean budget

**Principle: minimum spend, maximum output.** Everything that *can* be $0 (backend, LLM, design, analytics, hosting, ASO) *is* $0 via free tiers, BYO-key, and DIY. The only unavoidable spend is the two store fees.

### Minimum-to-launch (do this)

| Item | Cost | Recurring? |
| --- | --- | --- |
| Apple Developer Program | $99 | Yearly |
| Google Play Developer | $25 | One-time |
| Domain (landing + privacy policy + deletion URL) | ~$12 | Yearly (optional — free subdomain works) |
| Backend (Supabase / Firebase free tier) | $0 | — |
| LLM (offline engine + BYO key) | $0 | — |
| Analytics + crash reporting (PostHog / Firebase free) | $0 | — |
| Landing page hosting (GitHub Pages / Vercel / Netlify free) | $0 | — |
| Icons, screenshots, ASO, privacy policy (DIY / free generators) | $0 | — |
| **Minimum to launch (year 1)** | **≈ $124–136** | **≈ $111/yr thereafter** |

### Optional "spend-a-bit-more for leverage" (only once revenue justifies it)

| Item | Cost | Why |
| --- | --- | --- |
| Premium `.app` domain | ~$15–20/yr | Trust + brand. |
| RevenueCat | $0 → paid past $2.5k/mo | Cross-platform IAP without building billing. |
| Hosted-AI (Gemini PAYG) | ~$5–30/mo | Only when Plus users exist; **revenue-covered**. |
| Supabase Pro | $25/mo | When free-tier pausing / limits bite (real users). |
| Paid screenshot/ASO tooling or a designer pass | ~$50–150 one-time | Sharper store conversion. |
| Apple Search Ads test | ~$100–300 one-time | **Only** after D30 retention is proven. |

**Bottom line:** you can be **live on both stores for ~$124–136**, with **zero** ongoing infra or AI cost until paying users arrive to cover it.

---

## 5. Top risks & how to de-risk

| Risk | Why it matters | De-risk |
| --- | --- | --- |
| **Apple 4.2 rejection** (wrapped web app) | Most common rejection for WebView apps. | Ship 3+ native features (push, biometric lock, haptics), native-feeling nav, offline handling; **list them in review notes**. (Phase 1) |
| **Data loss on localStorage-only** | A journaling app that loses entries is dead on arrival. **Highest urgency.** | IndexedDB + export/import in **Phase 0**; encrypted cloud backup in Phase 2. |
| **AI cost creep** | Hosted AI at scale can bleed money. | Free tier = offline + BYO key ($0); hosted AI **gated behind Plus**, capped at ~120 output tokens, on Flash-Lite, proxied — cents/user, revenue-covered. |
| **Privacy / key exposure** | Contradicts the core pitch; erodes trust. | Move hosted AI behind a **backend proxy** (never ship a server key in the client); keep BYO-key on-device; local-first default; publish a privacy policy. |
| **Store compliance** (account deletion, data safety) | Blocks submission/updates. | Introduce accounts **only in Phase 2**, with in-app **and** web deletion URL from day one; complete both privacy forms. |
| **Undifferentiated, crowded market** | Every feature already exists elsewhere. | Lean on the **positioning wedge** ("private journal that talks back") and ship **long-term memory** — the single real gap vs. Rosebud/Day One. |

---

## 6. Key citations

- **Packaging:** [Capacitor](https://capacitorjs.com/) · [PWABuilder](https://www.pwabuilder.com/) · [PWA/Capacitor/TWA 2026 deep-dive](https://www.youngju.dev/blog/culture/2026-05-16-pwa-service-workers-2026-workbox-vite-pwa-capacitor-twa-ios-web-push-deep-dive.en) · [Capacitor + React 2026 guide](https://noqta.tn/en/tutorials/capacitor-react-mobile-app-ios-android-2026)
- **Apple 4.2:** [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) · [How to fix a 4.2 rejection](https://code2native.com/blog/fix-app-store-rejection-42-webview) · [WebView App Store checklist](https://code2native.com/blog/webview-app-apple-app-store-checklist)
- **Store costs:** [Apple Developer Program ($99)](https://developer.apple.com/programs/) · [Apple Small Business Program (15%)](https://developer.apple.com/app-store/small-business-program/) · [App Store vs Play Store 2026 fees & rates](https://appscreenshotstudio.com/blog/play-store-vs-app-store-key-differences-indie-devs-2026)
- **Store compliance:** [Play Data-safety section](https://support.google.com/googleplay/android-developer/answer/10787469) · [Play account-deletion requirement](https://support.google.com/googleplay/android-developer/answer/13327111)
- **Backend:** [Supabase pricing](https://supabase.com/pricing) · [Firebase pricing](https://firebase.google.com/pricing) · [Supabase vs Firebase free-tier 2026](https://agentdeals.dev/supabase-vs-firebase)
- **LLM cost:** [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)
- **Monetization / IAP:** [Day One plans](https://dayoneapp.com/plans/) · [Best journaling apps 2026 (pricing)](https://architectapp.ai/blog/best-journaling-apps-2026) · [RevenueCat](https://www.revenuecat.com/)
- **In-repo prior art:** [Journaling competitive analysis](./journal-competitive-analysis.md) · [Brand color strategy](./brand-color-strategy.md) · [Reflect-tab ideas](./reflect-tab-ideas.md) · [Completion moment](./completion-moment.md)
