import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { COMMON_EMOTIONS, MORE_EMOTIONS, getEmotion, type Emotion } from '../lib/emotions'
import { EmotionFace } from './MoodFace'

/**
 * Step 2 of the Hybrid selector: an OPTIONAL, skippable emotion tag. A compact
 * row of common feelings plus a "More" expansion. Tapping a selected tag again
 * clears it. Never blocks finishing an entry. Color + face + text label are
 * always shown together (colorblind-safe).
 */
export function EmotionPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (id: string | null) => void
}) {
  // Keep "More" open if the current selection lives in the expanded set.
  const [showMore, setShowMore] = useState(() =>
    MORE_EMOTIONS.some((e) => e.id === value),
  )

  const toggle = (id: string) => onChange(value === id ? null : id)

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Add a feeling (optional)">
        {COMMON_EMOTIONS.map((e) => (
          <EmotionOption key={e.id} emotion={e} selected={value === e.id} onSelect={() => toggle(e.id)} />
        ))}
        <button
          type="button"
          onClick={() => setShowMore((o) => !o)}
          aria-expanded={showMore}
          aria-label={showMore ? 'Show fewer feelings' : 'More feelings'}
          className="flex items-center gap-1 rounded-full border-2 border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-soft transition active:scale-95"
        >
          More
          <ChevronDown
            size={13}
            aria-hidden="true"
            className={`transition-transform ${showMore ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {showMore && (
        <div className="animate-rise mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="More feelings">
          {MORE_EMOTIONS.map((e) => (
            <EmotionOption key={e.id} emotion={e} selected={value === e.id} onSelect={() => toggle(e.id)} />
          ))}
        </div>
      )}
    </div>
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
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
        selected
          ? 'border-2 border-accent bg-accent-soft text-accent-text'
          : 'border-2 border-border bg-surface-2 text-content'
      }`}
    >
      <EmotionFace emotion={emotion.id} size={22} selected={selected} decorative />
      {emotion.label}
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
