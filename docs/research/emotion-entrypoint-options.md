# Where Mira's Optional "Feeling" Tag Should Live

> The optional categorical emotion tag currently hangs above the composer as a floating **＋ Add a feeling (optional)** pill — orphaned chrome that belongs to neither the conversation nor the composer. Three entry points were prototyped to re-home it somewhere intentional: **A** an emoji button in the composer, **B** an in-chat invite from Mira, and **C** folded into the mood step. They aren't mutually exclusive — **B and C were built behind a Settings toggle for testing**, with A the familiar on-demand fallback.

_Exploration only · no app source changed · droplet faces, chips, and composer mirror `src/components/*`; the emotion catalog + Pleasant/Unpleasant groups mirror `src/lib/emotions.ts`; tokens mirror `src/index.css` · all three mockups are interactive · compiled Aug 2026._

## At a glance

| Metric | Value |
| --- | --- |
| Entry points compared | **3** |
| Problem being fixed | **Orphaned floating pill** |
| Tag status | **Always optional** |
| Built for testing | **B & C, behind a Settings toggle** |

## The problem — an orphaned pill

Today the optional tag floats above the composer as a **＋ Add a feeling (optional)** pill. It reads as detached UI — not part of the conversation, not part of the composer. Each option below re-homes that same grouped picker somewhere it feels intentional.

## The three entry points

### A · Emoji button in the composer

A smiley sits in the composer row next to Finish. Tapping it opens the grouped picker as a small popover above — always one tap away, exactly where WhatsApp / iMessage put emoji. The chosen face replaces the smiley as a quiet confirmation.

- **Pros:** always available, at every point in the entry; familiar pattern — reads instantly as "add something"; zero floating chrome, the picker is summoned not parked; the chosen face replaces the smiley as a quiet confirmation.
- **Cons:** adds a control to an already busy composer row; a popover can crowd a small screen above the keyboard; discoverability rests on the icon being understood.
- **Best for:** people who want the feeling tag on tap at any moment, with the least new surface area and the most familiar mental model.

### B · Mira invites it conversationally

No persistent UI at all — Mira asks "Want to name the feeling? (optional)" and offers a row of quick-reply chips. Tap one and it posts as your reply, then the chips vanish and the thread moves on.

- **Pros:** purest conversational feel — it *is* the chat; ephemeral (nothing lingers once answered or ignored); feels like Mira caring, not a form to fill; naturally optional — skipping is just not replying.
- **Cons:** only offered when Mira asks — not on demand; easy to scroll past, lower capture rate likely; needs good timing logic so it isn't naggy or repetitive.
- **Best for:** leaning hardest into the conversational, companion feel — where the feeling is coaxed out gently rather than tracked.

### C · Fold into the mood step

It lives only at the very beginning, once. Tap a 1–5 face and an optional emotion step unfolds right there; pick one (or Skip) and the whole thing collapses into the conversation — nothing near the composer.

- **Pros:** one clear home, next to the mood it already extends; composer stays completely clean — no persistent control; reads as step 2 of "how are you?", a natural pairing; collapses away after — no lingering UI for the rest of the entry.
- **Cons:** only offered once, up front — no later "oh, actually…"; adds a beat to the opening moment before writing; miss the window and there's no second chance this entry.
- **Best for:** keeping the composer pristine and treating the feeling as part of the check-in ritual, captured once at the start.

## Quick read

- **A** maximizes availability and familiarity.
- **B** maximizes the conversational, ephemeral feel.
- **C** maximizes a clean composer by anchoring everything to the opening mood moment.

They aren't mutually exclusive — A (on-demand) plus C (the ritual) pair especially well, with B's wording as the optional nudge.

## Decision

**B and C were built behind a Settings toggle** so both can be tested against real usage — the conversational invite (B) and the folded-into-mood-step ritual (C) — with A's composer emoji button available as the familiar, always-on-demand fallback. Keeping the entry points switchable lets capture rate and "feels intentional" be measured before committing to a single home for the optional feeling tag.
