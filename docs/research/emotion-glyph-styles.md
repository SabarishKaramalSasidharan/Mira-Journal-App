# Mira's Emotion Faces — Ship the Mascot-Droplet

> Four premium SVG face styles compared for the Hybrid selector's emotion glyphs (the user felt the flat blobs looked too basic and asked for a "better emotion or smiley"). Recommendation: go with the **Mira mascot-droplet faces** — the one look no competitor can copy, still reads as a friendly smiley, and the new soft-gradient depth + mirror-shine are a clear premium jump. Because expression is shape-driven, the same renderer drops onto **both** the 1–5 ladder (level → expression) and the emotion tags (feeling → expression + a subtle color glow). Pick the glossy 3D set instead only if maximal smiley familiarity beats brand ownership.

_Exploration only · no app source changed · brand tokens mirror `src/index.css`, the droplet mirrors `src/components/Mascot.tsx` · all art is original SVG (no emoji fonts, no Pixar) · every style rendered across the same emotions (Joy · Calm · Sad · Anxious · Love) and the same 1–5 valence ladder · compiled Aug 2026._

## At a glance

| Metric | Value |
| --- | --- |
| Face styles rendered | **4** |
| Top pick | **Mira mascot-droplet faces** |
| Coverage per style | **5 emotions + the 1–5 ladder** |
| Legibility proven at | **24px** |

## Why gradients live only in the art

The premium finish (gradient, highlight, drop-shadow) lives **only inside the SVG face art and the Mira product panel** — that polish is the deliverable. The surrounding canvas chrome (cards, callouts, table) stays deliberately flat and token-driven. One shared expression resolver maps *both* the named emotions and the ladder levels to a face, which is why any style drops onto both layers with zero extra art.

## The four styles

### 1 · Mira mascot-droplet faces — *top pick* · soft gradient + shine

Mira's water-drop *is* the emotion — one identity, a distinct expression per feeling, plus a subtle emotion-tinted glow and the signature mirror-shine for premium depth. A clear step up from the flat blobs.

- **Pros:** maximally on-brand (the mascot literally becomes the mood); gradient + shine reads as premium, not flat; one character = instantly recognizable as Mira; expression differs by shape (brow/eye/mouth), not only color.
- **Cons:** teal body repeats — 15 tags lean on the accent glow to separate; a touch more art tuning per expression; less of the round-"smiley" silhouette the user mentioned.
- **Brand fit:** highest. **Expressive:** high. **Legible @24:** strong. **Scale → 15:** good.

### 2 · Glossy 3D-style smileys — radial gradient + drop shadow

Apple / Fluent-emoji-inspired tactile faces — radial-gradient volume, a glossy top highlight and a soft drop shadow. Exactly the familiar, premium "smiley" feel the user asked about (original art, not real emoji).

- **Pros:** the most familiar "smiley" — the tactile feel requested; gradient volume + highlight feels genuinely premium; per-emotion color is vivid and memorable; great at selector size.
- **Cons:** least brand-distinct — reads close to system emoji; gradients + shadow are heavier / less calm than Mira's flat UI; most art effort to keep 15 gradients on-model; shine can muddy the smallest sizes.
- **Brand fit:** low. **Expressive:** high. **Legible @24:** good (softens by 24px). **Scale → 15:** heavy.

### 3 · Soft flat / minimalist faces — two-tone · flat

Clean two-tone faces — a pale accent disc and a single accent ink. Calm, modern and razor-legible at any size, and the closest match to Mira's flat, token-based interface.

- **Pros:** calmest + most modern (matches Mira's flat UI); razor-sharp legibility at every size; cheapest to scale to 15+ (two tones, swap paths); no gradient / shadow slop.
- **Cons:** least tactile "wow" factor; not very distinctive on its own; can feel a little plain beside the glossy set.
- **Brand fit:** neutral. **Expressive:** medium. **Legible @24:** best in class. **Scale → 15:** best.

### 4 · Playful hand-drawn characters — inked outline + character

Slightly wobbly inked characters — bold outline, a little sprout, big highlighted eyes and rosy cheeks. The most personality and warmth, in a friendly Duolingo-adjacent spirit.

- **Pros:** most personality + warmth (friendly companion energy); big eyes make the emotion read clearly; a distinctive character system of its own; fun — encourages a daily check-in habit.
- **Cons:** playful tone can feel childish for heavier feelings; heavier line art to keep on-model across 15; busiest / least minimal of the four; slower to draw and localize.
- **Brand fit:** medium. **Expressive:** highest. **Legible @24:** good. **Scale → 15:** medium-heavy.

## All four, side by side

Brand distinctiveness pulls toward the droplet; the familiar "smiley" feel pulls toward glossy. The droplet is the only row that stays distinctly Mira while still reading as a friendly face.

| Style | Finish | Brand fit | Smiley feel | Expressive | Legible @24 | Scale → 15 | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Mira droplet** | Gradient + shine | Highest | Medium | High | Strong | Good | **Top pick** |
| Glossy 3D | Radial + shadow | Low | Highest | High | Good | Heavy | Runner-up (smiley feel) |
| Soft flat | Two-tone | Neutral | Medium | Medium | Best | Best | Best for scale + a11y |
| Doodle | Inked character | Medium | Medium | Highest | Good | Medium | If personality-first |

## Accessibility — face + label, never color alone

Nothing relies on color alone. Each feeling is drawn with a **distinct shape** (brow, eye and mouth) and always carries a **text label**, so the set is color-blind safe. Desaturated to simulate color-blindness, the mascot set still reads: brows-up + wavy mouth = Anxious, droop + tear = Sad. A real chip always pairs the face with its word — so Anxious (orange) and Joy (gold), or Sad (blue) and any neighbour, are disambiguated by the label, never the hue.

## Recommendation

**Primary — ship the Mira mascot-droplet faces.** One identity, one system: the droplet already carries the brand; giving it a soft gradient, an emotion-tinted glow and the mirror-shine turns the flat blobs into something premium and unmistakably Mira, while still reading as a warm, friendly smiley. It fits the Hybrid selector exactly — the same renderer maps a ladder level to an expression for the **1–5 opener**, and a named feeling to an expression + color glow for the **emotion tag** set, so both layers share one look and one code path.

**Pairing note.** If the full ~15-emotion tag grid ever needs stronger color separation, render those *same expressions* in the flat two-tone style — color does the sorting while the shape stays identical, keeping everything on-model without a second visual language.

**The honest counter.** **Glossy 3D** is the safest bet if the goal is purely the familiar, tactile smiley, but it trades away brand ownership and is heaviest to keep on-model across 15. **Soft flat** is the pragmatic pick if scale and accessibility win over delight. **Doodle** only if we want a personality-forward mascot world — charming, but busier and a touch childish for heavier feelings.

**Decision in one line:** Go **Mira mascot-droplet faces** — premium, distinctly Mira, still a friendly smiley, and one shape-driven system that serves both the 1–5 ladder and the emotion tags. Glossy 3D is the runner-up if maximal smiley familiarity beats brand distinctiveness.
