/**
 * Where the OPTIONAL "add a feeling" emotion tag lives on the Write screen.
 *
 * An experiment toggle (Labs) for the faces selector's step-2 emotion tag. It
 * only changes WHERE/HOW the picker is offered — never the selection outcome
 * (posting the emotion bubble, setting `Entry.emotion`, firing the emotion
 * follow-up are identical across modes).
 *
 *   "pill"           (default) = the current collapsed "＋ Add a feeling
 *                                (optional)" pill near the mood step.
 *   "conversational" = Option B — Mira invites it in the chat with a row of
 *                      quick-reply emotion chips that vanish once answered.
 *   "moodstep"       = Option C — folded into the opening mood step as an
 *                      in-place emotion tag with a Skip affordance.
 *
 * Persisted in localStorage exactly like the mood-selector style preference
 * (see `selectorStyle.ts`). Default is "pill" so existing users see no change.
 */
export type FeelingEntry = 'pill' | 'conversational' | 'moodstep'

const KEY = 'mira.feelingEntry.v1'

export const DEFAULT_FEELING_ENTRY: FeelingEntry = 'pill'

export function loadFeelingEntry(): FeelingEntry {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'pill' || v === 'conversational' || v === 'moodstep') return v
  } catch {
    /* ignore — fall back to default */
  }
  return DEFAULT_FEELING_ENTRY
}

export function saveFeelingEntry(mode: FeelingEntry) {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    /* best-effort persistence */
  }
}
