# Grouping Mira's Emotion Tags by Color — Ship the 2-Group Split

> Coloring all 16 emotion droplets with 16 distinct hues is noisy. Instead, color each droplet by its **group** — the color tells the *kind* of feeling, while the mascot expression and the always-visible label carry the specific emotion (so it stays colorblind-safe). Two groupings were previewed: **Option A** (3 groups — Pleasant / Difficult / Low·Numb) and **Option B** (2 groups — Pleasant / Unpleasant). Direction chosen: **Option B**, the quietest, cleanest scan.

_Exploration only · no app source changed · droplet + per-emotion expressions ported from `src/components/MoodFace.tsx`, the 16 emotions from `src/lib/emotions.ts`, brand tokens from `src/index.css` · previewed in light and dark themes · compiled Aug 2026._

## At a glance

| Metric | Value |
| --- | --- |
| Emotions in the tag set | **16** |
| Colors, Option A | **3 (by valence)** |
| Colors, Option B | **2 (Pleasant / Unpleasant)** |
| Direction chosen | **Option B** |

## The idea — color the kind, not the emotion

Rather than 16 hues competing for attention in the "Add a feeling?" picker, each droplet body is filled with its **group** color (a top→bottom gradient). Within a group, emotions are told apart by the mascot expression (brow / eyes / mouth) plus the always-visible text label. Chips are clustered under small group subheadings.

## The two groupings

### Option A — 3 groups (by valence)

| Group | Color | Emotions |
| --- | --- | --- |
| Pleasant | Green | Joy, Excited, Love, Hope, Gratitude, Content, Calm |
| Difficult | Blue | Sad, Anxious, Lonely, Guilt, Frustrated, Embarrassed, Envy |
| Low / Numb | Slate grey | Empty, Ennui / Bored |

- **Pros:** more nuance; separates active distress (Difficult / blue) from flat low-energy (Low·Numb / grey); three calm colors map cleanly onto how the feeling actually reads.
- **Cons:** one extra color to learn; the Difficult bucket is broad (Anxious sits beside Envy and Frustrated).

### Option B — 2 groups

| Group | Color | Emotions |
| --- | --- | --- |
| Pleasant | Green | Joy, Excited, Love, Hope, Gratitude, Content, Calm |
| Unpleasant | Muted blue-grey | Sad, Anxious, Lonely, Guilt, Frustrated, Embarrassed, Envy, Empty, Ennui / Bored |

- **Pros:** the calmest, cleanest scan; only two colors; a crisp Pleasant / Unpleasant split.
- **Cons:** lumps numb / Empty in with Anxious and Sad, so the low-energy vs. distress distinction is lost to color (only the face + label carry it).

## Contrast & colorblind safety

The dark mascot ink (`#0b3b36`) sits on the lighter crown of each group body, where it clears WCAG AA (≥ 4.5:1) against the Pleasant green, the Difficult blue, the Low·Numb slate, and Option B's muted blue-grey — the same mid-tone rationale the app already uses for the per-emotion fills. Color never carries meaning alone: within a group, emotions are told apart by the mascot expression plus the always-visible text label, so the grouping stays colorblind-safe. The same group bodies were previewed on Mira's dark surface; the dark mascot ink stays legible on both themes.

## Decision

The canvas weighed both as solid: Option A keeps numb / low apart from active distress with almost no added noise, while Option B is the safer pick when the goal is the absolute quietest picker. The direction chosen is **Option B** — the two-color Pleasant / Unpleasant split — trading Option A's extra low-energy distinction for the calmest possible scan, since the mascot expression and label already carry the specific feeling within each group.
