# Mira's Mood Selector — Go Hybrid: 1–5 Scale + Optional Emotion Tag

> Nine mood-selector concepts compared against the one decision that changes everything — **ordered scale vs. categorical**. Recommendation: ship the **Hybrid (Option 9)** — keep the fast one-tap ordered 1–5 opener (as Mira mascot expressions with word-chip labels) so the mood-trend chart stays untouched, then let users *optionally* attach a specific named emotion as a categorical tag. Speed *and* charts *and* rich feelings, no either/or. Use the grouped two-tier wheel (Option 8) as the model for the tag layer, and keep the weather scale live to A/B.

_Exploration only · no app source changed · brand tokens mirror `src/index.css`, scale mirrors `MOOD_SCORE` (rough=1 … great=5) · all glyphs are original SVG (no emoji, no Pixar art) · compiled Aug 2026._

## At a glance

| Metric | Value |
| --- | --- |
| Concepts compared | **9** |
| Recommended | **Hybrid — 1–5 + emotion tag** |
| Weather baseline | **Kept live for A/B** |
| Emotions supported | **6 → 20+ via grouped two-tier wheel** |

## The one decision that changes everything: scale vs. categorical

Today's selector is an **ordered 5-point valence scale** — the Reflect tab averages those 1–5 scores into a line chart over time. This is the axis every option must be judged against:

- **Scale** concepts (weather, mascot, classic faces, orbs, chips, slider) are drop-ins: the chart is untouched.
- **Categorical** concepts (the Inside Out–inspired emotions, the grouped wheel) capture richer feeling but have *no inherent order* — you can't average "Angry" and "Joy." Choosing one means rebuilding Reflect around frequency (stacked bars / an emotion wheel), not a trend line.

The **Hybrid (Option 9) sidesteps this entirely** — an ordered score for the trend line *plus* an optional emotion tag stored alongside for a separate breakdown.

## The nine concepts

### 1 · Weather scale — *current, keep*

The shipped baseline: rain-cloud → cloudy → sun-behind-cloud → sun-with-cloud → full sun. An ordered scale.

- **Pros:** already shipped, loved, and understood; ordered gradient reads as a scale at a glance; calm, non-clinical metaphor; icon shapes differ, not just color.
- **Cons:** weather ≠ mood for some (a sunny day can feel rough); not uniquely Mira; five weather states blur at small sizes.
- **Chart fit:** scale — preserves the 1–5 the Reflect chart already consumes. **Effort:** Low.

### 2 · Emotion faces — Inside Out–inspired *(original art, not Pixar IP)*

A categorical set of named emotions, each with a signature color and expressive face: Joy=yellow, Sad=blue, Angry=red, Anxious=purple, Calm=teal (aligned to the brand).

- **Pros:** names the feeling — more expressive than a 1–5 rating; intuitive, memorable color language; teal "Calm" ties the happy path to the brand accent.
- **Cons:** categorical — breaks the ordered mood-trend chart; risks reading as derivative of a famous franchise; five emotions is a lossy map; most design + engineering effort of any option.
- **Chart fit:** categorical — needs a new visualization. **Effort:** High.

### 3 · Mira mascot expressions

The reflection droplet wears five expressions as the scale — the selector literally becomes the mascot. Most on-brand of every concept.

- **Pros:** maximally on-brand; warm and empathetic; stays an ordered 1–5 scale (chart untouched); faces differ by shape, not just color.
- **Cons:** five droplet faces must stay clearly distinguishable; one character repeated can read as less varied; slightly more art polish.
- **Chart fit:** scale — drop-in, zero analytics rework. **Effort:** Medium.

### 4 · Classic 5-face scale

A clean gradient of simple round faces, frown → grin, tinted along the valence palette.

- **Pros:** universally understood, zero learning curve; fast to read and build; valence tint reinforces the scale.
- **Cons:** generic — looks like every other mood tracker; no brand personality; can feel clinical / survey-like.
- **Chart fit:** scale — drop-in. **Effort:** Low.

### 5 · Abstract color orbs

Minimal, premium color discs — mood-as-color, no faces.

- **Pros:** premium, minimal, calm aesthetic; language-agnostic; color gradient still encodes an ordered scale.
- **Cons:** meaning isn't obvious without labels; color-only encoding is an accessibility risk; can feel cold for an emotional moment.
- **Chart fit:** scale via the color gradient — drop-in. **Effort:** Low.

### 6 · Word chips

Text-only pills — Rough / Low / Okay / Good / Great. The most accessible option.

- **Pros:** zero ambiguity (the label *is* the meaning); most accessible — real text, screen-reader native; trivial to build and localize; left-to-right order reads as a scale.
- **Cons:** plainest option, little visual delight; no brand personality on its own; text-heavy for a quick tap-to-begin moment.
- **Chart fit:** scale — drop-in. **Effort:** Low.

### 7 · Mood slider (+ 2-axis note)

A single continuous track from Rough → Great.

- **Pros:** tactile, playful, quick to set; continuous input → finer-grained data; naturally an ordered scale.
- **Cons:** continuous precision is false (mood isn't that exact); fiddly on touch, harder for motor/low-vision users; needs discrete snap points to map back to 1–5.
- **Chart fit:** scale, but snap to 5 stops to stay chart-compatible. **Effort:** Medium.
- **Sidebar — the 2-axis (valence × energy) grid:** a richer alternative maps mood on pleasant↔unpleasant × low↔high energy (the "How We Feel" model). Powerful for a future "deep check-in," but categorical-ish and heavier — overkill for the one-tap opener.

### 8 · Grouped two-tier emotion picker

The proven way to support many emotions (How We Feel / Apple State of Mind / Plutchik): a fast tier of **6 core families** (Joy, Love, Calm, Sad, Anger, Fear) plus an optional "be more specific" tier that expands to Low, Lonely, Guilt, Ennui, Anxiety, Embarrassment, and more.

- **Pros:** scales gracefully from 6 families to 20+ specifics; capture stays one-tap, granularity is opt-in; grouping teaches the emotion vocabulary; every item is color + face/dot + label.
- **Cons:** two tiers add a step vs. a single scale; categorical — no ordered score for a trend line; more content to design, localize, and maintain.
- **Chart fit:** categorical — works best as the *tag layer inside the Hybrid*, not the sole selector. **Effort:** High.

### 9 · Hybrid — 1–5 scale + optional emotion tag — *recommended*

A fast ordered opener that keeps the chart, plus an optional named-emotion tag that adds the richness. Tap a mascot level, then (optionally) attach a feeling.

- **Pros:** keeps the one-tap ordered 1–5 → chart works untouched; optional tag adds categorical richness on demand; best of both — valence trend *and* a "what you felt" breakdown; brand-distinct via the mascot; low-risk (weather stays live).
- **Cons:** the optional second step must feel truly optional; two data shapes to store (score + tag) and surface in Reflect; the tag taxonomy still needs the grouped wheel's design work.
- **Chart fit:** hybrid — ordered score feeds the existing trend line with zero rework; the tag is stored alongside as categorical data. **Effort:** Medium.

## All nine, side by side

"Chart fit" and "Chart rework" are the decisive axes: **scale** and **hybrid** are drop-ins for today's trend line; **categorical** needs a new Reflect view. The Hybrid is the only row that scores well on *every* axis at once.

| Concept | Chart fit | Speed | Accessibility | Brand fit | Chart rework | Expressive | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Weather scale (current) | Ordered scale | 1 tap | Labeled + shape | Owned | None | Low | Keep / pair |
| Emotion faces (IO-inspired) | Categorical | 1 tap | Labeled | Derivative | New view | Medium | — |
| Mira mascot expressions | Ordered scale | 1 tap | Labeled + shape | Most on-brand | None | Low | Keep / pair |
| Classic 5-face scale | Ordered scale | 1 tap | Add labels | Generic | None | Low | — |
| Abstract color orbs | Ordered scale | 1 tap | Color-only risk | Ambiguous | None | Low | — |
| Word chips | Ordered scale | 1 tap | Best — text | Plain | None | Low | Keep / pair |
| Mood slider | Ordered scale | 1 drag | Needs ARIA | Neutral | Snap to 5 | Low | — |
| Grouped two-tier wheel | Categorical | 1–2 taps | Labeled + grouped | Strong | New view | High | Keep / pair |
| **Hybrid: 1–5 + emotion tag** | **Hybrid** | **1 tap (+opt)** | **Labeled + shape** | **Distinct (mascot)** | **None** | **High** | **Recommended** |

## Scaling to many more emotions — the resolved color system

The user proposed a much richer set (Anxiety, Envy, Ennui, Embarrassment, Love, Hope, Guilt, …). Five flat chips don't scale — but the grouped two-tier model does. The movie palette clashes with Mira's brand, so it's retuned so nothing collides and nothing is encoded by color alone:

| Emotion | Color | Note |
| --- | --- | --- |
| Calm | Teal | Brand teal — kept as the steady anchor |
| Envy | Green / lime | Moved off the film's teal |
| Anxiety | Orange | High-arousal fear |
| Embarrassment | Pink | — |
| Ennui / Bored | Indigo | Distinct from Sad's blue |
| Sad | Blue | — |
| Love | Rose | Warmer than Anger's red |
| Hope | Soft green | A lift within Joy |
| Guilt | Muted plum | — |
| Anger | Red | — |
| Fear | Purple | — |
| Joy | Gold | Warm optimism |

Every emotion pairs a **color + a face/dot + a text label**, and each hue holds WCAG AA contrast against both light (`#eef4f2`) and dark (`#0d1514`) surfaces. Because meaning is never carried by color alone, the set is **color-blind safe** — the label always disambiguates neighbors like Anxiety (orange) vs. Frustration, or Ennui (indigo) vs. Sad (blue).

## Duty-of-care guardrails

- **Don't ship "Depression" as a mood.** It's a clinical condition, not a momentary feeling; labeling days "Depression" invites self-diagnosis and carries real duty-of-care weight. Use everyday words for the low end instead — **Low, Down, Empty, Numb**.
- **Recommend a quiet wellbeing safety net.** If someone logs very low moods repeatedly, Mira should gently and non-judgmentally surface support resources (a calm check-in, crisis/helpline links). A product + ethics recommendation, not something to build now — but the responsible companion to richer negative-emotion tracking.
- **Parked: "Rebellion."** Reads as an attitude/state, not a core emotion — at most an optional entry buried deep in the expanded list, never in the core set.

## Recommendation

**Primary — ship the Hybrid.** The ordered opener (Mira mascot expressions + word-chip labels) keeps capture to one tap and feeds the existing 1–5 mood-trend chart with *zero rework*. The optional tag adds the rich, named emotions the user is after — stored as categorical data for a separate "what you felt" breakdown in Reflect. Use the **grouped two-tier wheel** as that tag layer (six families, ~2–3 children each, scaling to 20+, on the collision-resolved, color-blind-safe palette). Keep the **weather scale live** and A/B the mascot opener against it — because the baseline stays, every step here is low-risk and reversible.

**The honest counter.** A pure emotion picker (Options 2 & 8) is the most expressive but breaks the trend line and adds daily friction; folding it in as an *optional* layer keeps the upside without the cost. Classic faces / orbs / slider stay also-rans — generic or accessibility-risky without buying distinctiveness. The Hybrid is more to build and its second step must feel genuinely optional; if the mascot opener doesn't beat weather in the A/B, shipping just the scale is still a fine outcome, and the tag can follow later.

**Decision in one line:** Go **Hybrid** — an ordered 1–5 mascot opener (keeps speed + the chart) with an **optional emotion tag** from the grouped, color-blind-safe wheel (adds granularity). Distinctive via the mascot, safe for analytics, kind by design, and easy to A/B since the weather scale stays live.
