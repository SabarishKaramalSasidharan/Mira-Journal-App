# What More Can Mira's Reflect Tab Do?

> A prioritized menu of 19 concrete Reflect-tab ideas across three tiers (Quick wins, Medium, Ambitious), grounded in leading journaling apps + reflection science, mapped on an effort/impact grid, with a recommended 5-item build order. The guardrail: deepen the calm "mirror," don't bolt on a dashboard.

_A prioritized menu grounded in leading journaling apps + reflection science · compiled Aug 2026._

## At a glance

| Metric | Value |
| --- | --- |
| Reflect surfaces studied | **9** |
| Concrete ideas, 3 tiers | **19** |
| Quick wins on data you already store | **8** |
| Recommended, in build order | **5** |

## Design guardrail — protect the calm mirror

Reflect today has five quiet elements: the header, the **insight card** ("The pattern"), the **mood trend** with range toggle, the **theme bars**, and a **two-stat footer**. It is clean on purpose. The goal is not to bolt on dashboards — it's to deepen the "mirror" with a few resonant additions, and tuck heavier analytics behind a "Reflect deeper" tap so the main page stays unhurried.

## What leading apps put on their reflect / insights surface

Legend: **Yes** = shipped and solid · Partial = present but shallow/gated · — = absent.

| App | On this day | Mood trend | Mood ↔ theme correlation | Themes / word cloud | Weekly recap | Year in review | Emotion granularity | AI narrative |
| --- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Mira (today)** | — | Yes | — | Yes | Partial | — | Partial | Yes |
| Day One | Yes | Partial | — | Partial | — | Partial | — | Yes |
| Apple Journal | Partial | Partial | — | — | — | — | Partial | Partial |
| Reflectly | — | Yes | Yes | Partial | Yes | — | Partial | Yes |
| Daylio | Partial | Yes | Yes | Yes | Yes | Yes | Partial | — |
| Stoic | Partial | Yes | Yes | Partial | Partial | Partial | Partial | Yes |
| How We Feel | Partial | Yes | Yes | Yes | Yes | — | Yes | Partial |
| Exist.io | Yes | Yes | Yes | Partial | Yes | — | — | — |
| Rosebud | Partial | Yes | Yes | Yes | Yes | Partial | Partial | Yes |

**Takeaway:** Mira already leads on **AI narrative** and **themes**, but trails the field on **memory resurfacing** ("On this day"), **mood↔theme correlation**, a real **weekly recap**, and **year-in-review**. Those are exactly the highest-loved features — and most are cheap on data Mira already has.

## The idea menu, mapped by effort vs. impact

Impact and effort are directional estimates for Mira's local-first stack. Tiers: 🟢 Quick win · 🔵 Medium · 🟣 Ambitious. Quadrants run: _Quick wins — do first_ (low effort/high impact), _Big bets_ (high effort/high impact), _Easy extras_ (low effort/low impact), _Heavy — defer_ (high effort/low impact).

| ID | Idea | Tier | Effort (0.5–5) | Impact (2–5) |
| --- | --- | --- | :---: | :---: |
| Q8 | Weekly recap card | Quick win | 1.9 | 4.6 |
| Q1 | On this day | Quick win | 1.3 | 4.3 |
| Q7 | Emotion-word weather | Quick win | 2.3 | 3.9 |
| Q2 | Best / hardest weekday | Quick win | 1.2 | 3.5 |
| Q5 | Time-of-day patterns | Quick win | 2.2 | 3.1 |
| Q6 | Themes over time | Quick win | 1.5 | 2.9 |
| Q4 | Longest streak & consistency % | Quick win | 1.0 | 2.6 |
| Q3 | Mood distribution donut | Quick win | 2.0 | 2.5 |
| M1 | Mood × theme correlation | Medium | 3.3 | 4.4 |
| M2 | Calendar mood heatmap | Medium | 2.9 | 4.2 |
| M3 | Weekly review ritual | Medium | 3.5 | 4.0 |
| M4 | Gratitude / wins digest | Medium | 3.0 | 3.6 |
| M5 | Emotional-vocabulary growth | Medium | 3.5 | 3.2 |
| M6 | Theme trend sparklines | Medium | 2.7 | 2.9 |
| A1 | Reflect with Mira (chat recap) | Ambitious | 4.6 | 4.7 |
| A4 | Year in review — Mira Wrapped | Ambitious | 4.4 | 4.2 |
| A3 | Patterns + gentle suggestions | Ambitious | 4.3 | 3.9 |
| A2 | Monthly / seasonal narrative | Ambitious | 4.0 | 3.7 |
| A5 | Theme-based prompt suggestions | Ambitious | 3.8 | 3.5 |

## Tier 1 · Quick wins

Small additions on data Mira already stores — moods, themes, timestamps, streaks, entry text. Data legend: **Have it** = uses stored data · Mostly = partly present · New calc = needs a new computation.

| # | Idea | Why it's valuable | Data | Effort | Risk to watch |
| --- | --- | --- | --- | --- | --- |
| Q8 | Weekly recap card _(on-brand)_ | A single warm summary — entries, avg mood, top theme, one win — anchors the ritual reviewers say drives retention. | Have it — mood, themes, turns, streak | Low | Keep it to one card; don't restate other sections. |
| Q1 | On this day _(on-brand)_ | Memory resurfacing is Day One's most-loved feature and a strong return-visit hook ("resurface last month's entry"). | Have it — createdAt, summary, mood | Low | Hide when no past entry exists; older memories can sting. |
| Q7 | Emotion-word weather _(on-brand)_ | Surface the feeling words you used most — affect labeling ("name it to tame it") lowers amygdala reactivity. | Have it — turns text + FEELING_WORDS | Low | Frame gently; avoid over-labeling low-intensity days. |
| Q2 | Best / hardest weekday | Extends the existing insight into a durable stat ("Tuesdays run heavier"); mirrors Exist.io's day-of-week averages. | Have it — mood + createdAt weekday | Low | Needs enough data; show confidence, not false certainty. |
| Q5 | Time-of-day patterns | When you write and how you feel by morning/evening — nudges toward the best reflection window. | Have it — createdAt hour + mood | Low | Sparse hourly data; bucket into 3–4 day-parts. |
| Q6 | Themes over time | Most-used themes this month vs last makes "what kept coming up" feel like movement, not a static list. | Have it — themes + createdAt | Low | Avoid clutter — a compact delta, not another chart. |
| Q4 | Longest streak & consistency % | streakStats already computes personal best; % of days logged rewards consistency without punishing misses. | Have it — streak logic (exists) | Low | Keep non-punitive — celebrate, never shame a gap. |
| Q3 | Mood distribution donut | Share of ☀️→🌧️ over a range gives an at-a-glance emotional balance, complementing the line trend. | Have it — mood | Low | One more chart — only if it earns its space. |

## Tier 2 · Medium

Some new computation or light UI — trends, correlations, a review flow, a heatmap.

| # | Idea | Why it's valuable | Data | Effort | Risk to watch |
| --- | --- | --- | --- | --- | --- |
| M1 | Mood × theme correlation | Daylio's crown jewel, adapted: "entries about #work skew lower." The insight users can't see from inside a day. | Mostly — mood + themes | Med | Correlation ≠ cause; add confidence + gentle wording. |
| M2 | Calendar mood heatmap _(on-brand)_ | A calm "year in pixels" — mood-colored day grid. Beautiful, glanceable, reinforces the reflective mirror. | Have it — mood + createdAt | Med | Empty days shouldn't read as failure. |
| M3 | Weekly review ritual _(on-brand)_ | A gentle guided review (wins, themes, one small adjustment) — the research-backed weekly habit that beats daily rote. | Mostly — existing + prompts | Med | Make it optional; a tap, not a chore. |
| M4 | Gratitude / wins digest _(on-brand)_ | Collect the good moments — specific gratitude with reasons produces lasting well-being gains (Emmons & McCullough). | Mostly — turns text (light detect / LLM) | Med | Detection misses; let users pin a "win". |
| M5 | Emotional-vocabulary growth _(on-brand)_ | Track breadth of feeling words over time and gently suggest new ones — builds emotional granularity. | Mostly — turns text + FEELING_WORDS | Med | Never make richer vocabulary feel like homework. |
| M6 | Theme trend sparklines | Each theme's rise/fall across weeks turns tags into a story of what's growing or fading. | Have it — themes + createdAt | Med | Sparse themes look noisy; require a minimum count. |

## Tier 3 · Ambitious / differentiating

LLM-powered, with an offline rule-based fallback — the surfaces that make Mira feel like a companion, not a dashboard.

| # | Idea | Why it's valuable | Data | Effort | Risk to watch |
| --- | --- | --- | --- | --- | --- |
| A1 | Reflect with Mira (chat recap) _(on-brand)_ | The mascot talks you through your week in the same chat UI you journal in — no incumbent pairs a companion with private, on-device AI. | Mostly — LLM + entries (offline fallback) | High | Must degrade to rule-based recap offline. |
| A4 | Year in review — Mira Wrapped | Daylio's Year in Pixels + Stoic Wrapped are share/retention magnets; a warm annual narrative fits the brand. | Mostly — LLM + all entries | High | Privacy on any sharing; keep export local-first. |
| A3 | Patterns + gentle suggestions | Detected patterns with a soft nudge ("you feel lighter on days you mention walks") — Rosebud's paid differentiator. | Mostly — LLM + correlations | High | Advice tone risk; suggest, never prescribe. |
| A2 | Monthly / seasonal narrative | A short written story of your month gives the overview daily life hides — Rosebud/Mindsera weekly reports at a calmer cadence. | Mostly — LLM + month of entries | High | Cost/latency; cache and generate on demand. |
| A5 | Theme-based prompt suggestions _(on-brand)_ | "You've written about your dad 4×—want a prompt?" turns recurring themes into gentle depth, echoing Day One's Go Deeper. | Mostly — themes + LLM | Med-High | Don't nag; surface at most one, dismissible. |

## Recommended shortlist & build order

Five, sequenced so each ships value on its own and the page never turns into a dashboard. Cheap-and-warm first, the companion differentiator last.

| # | Build | Why now | Where it lives |
| :---: | --- | --- | --- |
| 1 | Weekly recap card (Q8) | Lowest effort, highest ritual value; reframes the footer stats into one warm summary and anchors the page. | Replaces the two footer stat tiles |
| 2 | On this day (Q1) | Emotional return-visit hook using data you already store; the single most-loved feature in the category. | Top of Reflect, above the insight card |
| 3 | Calendar mood heatmap (M2) | The signature calm visual — a "year in pixels" that makes consistency felt without words or pressure. | Below the mood trend, collapsible |
| 4 | Emotion-word weather (Q7 → M5) | Cheap, deeply on-brand: reinforces the mirror + affect-labeling science, and seeds vocabulary growth later. | Beside "What kept coming up" |
| 5 | Reflect with Mira (A1) | The true differentiator — a companion recap in-chat, offline-capable. Build last, once the data views exist to feed it. | A "Reflect with Mira" entry, opens the chat |

## Best fit for the calm / mirror brand

Lean into ideas that feel like reflection, not analytics: **On this day**, **Weekly recap**, **Emotion-word weather**, **Calendar heatmap**, and the **Reflect-with-Mira** recap voiced by the mascot. Each reinforces "the mirror — what your entries are quietly telling you," and the droplet mascot is the natural narrator for the weekly and yearly recaps.

## Keep behind a "Reflect deeper" tap

Heavier, chart-dense features — **mood × theme correlation**, **time-of-day**, **mood donut**, **theme sparklines** — belong on a secondary screen. Correlation and pattern claims need confidence framing and gentle, non-prescriptive wording, and everything must degrade gracefully offline given the local-first, pluggable-LLM design.

## Sources

- [Daylio — activity/mood stats & correlations](https://daylio.net/faq/activity-and-mood-statistics/)
- [Day One — features (On This Day, streaks)](https://dayoneapp.com/features/)
- [Day One — Apple Intelligence: Go Deeper & Highlights](https://dayoneapp.com/releases/ios-26-liquid-glass-plus-apple-intelligence/)
- [Apple — Journal app & reflection prompts](https://www.apple.com/newsroom/2023/12/apple-launches-journal-app-a-new-app-for-reflecting-on-everyday-moments/)
- [Reflectly — mood correlations, weekly/monthly overviews](https://apps.apple.com/us/app/reflectly-journal-ai-diary/id1241229134)
- [How We Feel — patterns & Calendar tab](https://howwefeel.substack.com/p/finding-the-patterns)
- [Stoic — insights, trends, guided reflections](https://www.getstoic.com/features)
- [Exist.io — mood correlations & "this day last year"](https://exist.io/about/mood/)
- [Rosebud — long-term memory & weekly reports](https://www.rosebud.app/blog/ai-journaling-vs-traditional-journaling)
- [Gratitude & weekly review — what the science says](https://www.simplypsychology.com/articles/journaling-for-mental-health)
- [Affect labeling — "name it to tame it"](https://www.6seconds.org/2021/01/08/naming-emotions-affect-labeling-emotional-intelligence/)
- [Affect labeling — timing & intensity (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9799301/)
