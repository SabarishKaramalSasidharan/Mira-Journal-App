import { useState } from 'react'
import { ChevronUp, Plus } from 'lucide-react'
import { EMOTION_GROUPS, getEmotion, type Emotion, type EmotionGroup } from '../lib/emotions'
import { EmotionFace } from './MoodFace'

/**
 * Step 2 of the Hybrid selector: an OPTIONAL, skippable emotion tag. To keep the
 * conversation front-and-center (and honor the fast one-tap philosophy) it stays
 * COLLAPSED by default — a subtle "＋ Add a feeling (optional)" pill. Only when
 * tapped does it expand into TWO clustered groups — Pleasant and Unpleasant.
 * Each group sits under an uppercase subheading (a small filled dot in the group
 * color + the group name + the count) followed by its compact chips (a small
 * droplet face BESIDE its label, pill/row style). The droplet BODY is the GROUP
 * color; WITHIN a group the specific feeling is carried by the mascot expression
 * + the always-visible label (colorblind-safe). Tapping a selected chip again
 * clears it; the picker never blocks finishing an entry. A chevron re-collapses
 * the expanded state. Entrances reuse the calm `animate-rise` utility, which
 * already respects `prefers-reduced-motion`.
 *
 * The expanded section scrolls within the existing composer area if it gets tall.
 */
export function EmotionPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (id: string | null) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const toggle = (id: string) => onChange(value === id ? null : id)

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-expanded={false}
        aria-label="Add a feeling, optional"
        className="animate-rise ml-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-soft transition active:scale-95 hover:text-content"
      >
        <Plus size={14} aria-hidden="true" />
        Add a feeling <span className="text-mute">(optional)</span>
      </button>
    )
  }

  return (
    <div className="animate-rise">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-soft">Add a feeling? (optional)</span>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-expanded={true}
          aria-label="Collapse feelings"
          className="-mr-1 grid h-6 w-6 place-items-center rounded-full text-mute transition active:scale-90 hover:bg-surface-2 hover:text-content"
        >
          <ChevronUp size={16} aria-hidden="true" />
        </button>
      </div>
      <EmotionGroupChips value={value} onToggle={toggle} />
    </div>
  )
}

/**
 * The two clustered Pleasant / Unpleasant chip sections on their own — shared by
 * the collapsed pill picker (expanded state) AND the "with mood" step (Option
 * C), so the chip rendering stays identical across entry points. `onToggle`
 * receives the tapped emotion id.
 */
export function EmotionGroupChips({
  value,
  onToggle,
  className = 'no-scrollbar flex max-h-[40vh] flex-col gap-3 overflow-y-auto',
}: {
  value: string | null
  onToggle: (id: string) => void
  className?: string
}) {
  return (
    <div className={className}>
      {EMOTION_GROUPS.map((group) => (
        <EmotionGroupSection key={group.key} group={group} value={value} onToggle={onToggle} />
      ))}
    </div>
  )
}

function EmotionGroupSection({
  group,
  value,
  onToggle,
}: {
  group: EmotionGroup
  value: string | null
  onToggle: (id: string) => void
}) {
  return (
    <section aria-label={`${group.label} feelings`}>
      <div className="mb-2 flex items-center gap-1.5 px-1">
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: group.color.bottom }}
          aria-hidden="true"
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-mute">{group.label}</span>
        <span className="text-[11px] font-semibold text-mute opacity-70">{group.emotions.length}</span>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={`${group.label} feelings`}>
        {group.emotions.map((e) => (
          <EmotionOption key={e.id} emotion={e} selected={value === e.id} onSelect={() => onToggle(e.id)} />
        ))}
      </div>
    </section>
  )
}

function EmotionOption({
  emotion,
  selected,
  onSelect,
}: {
  emotion: Emotion
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={emotion.label}
      title={emotion.label}
      className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 transition active:scale-95 ${
        selected
          ? 'border border-accent bg-accent-soft'
          : 'border border-transparent bg-surface-2'
      }`}
    >
      <EmotionFace emotion={emotion.id} size={24} selected={selected} decorative />
      <span
        className={`text-xs font-medium leading-none ${
          selected ? 'text-accent-text' : 'text-soft'
        }`}
      >
        {emotion.label}
      </span>
    </button>
  )
}

/**
 * A compact read-only emotion tag for entry surfaces (Timeline, EntryDetail):
 * face glyph + label. Renders nothing for an unknown/missing emotion.
 */
export function EmotionChip({ emotion, size = 18 }: { emotion?: string; size?: number }) {
  const meta = getEmotion(emotion)
  if (!meta) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-content ring-1 ring-border">
      <EmotionFace emotion={meta.id} size={size} decorative />
      {meta.label}
    </span>
  )
}
