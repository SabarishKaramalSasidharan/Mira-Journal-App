import { useEffect, useState } from 'react'
import { ChevronLeft, Check, Pencil, Trash2, X } from 'lucide-react'
import type { Entry, Mood, Turn } from '../types'
import { MOODS } from '../types'
import { extractThemes, summarize } from '../lib/ai'
import Mascot from './Mascot'

interface Props {
  entry: Entry
  onClose: () => void
  onSave: (entry: Entry) => void
  onDelete: (id: string) => void
}

const MOOD_VAR: Record<Mood, string> = {
  rough: 'var(--mood-rough)',
  low: 'var(--mood-low)',
  okay: 'var(--mood-okay)',
  good: 'var(--mood-good)',
  great: 'var(--mood-great)',
}

function fullWhen(ts: number) {
  const d = new Date(ts)
  const today = new Date().toDateString()
  const yest = new Date(Date.now() - 864e5).toDateString()
  const day =
    d.toDateString() === today
      ? 'Today'
      : d.toDateString() === yest
        ? 'Yesterday'
        : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  return `${day} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

export default function EntryDetail({ entry, onClose, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [draftTurns, setDraftTurns] = useState<Turn[]>(entry.turns)
  const [draftMood, setDraftMood] = useState<Mood | null>(entry.mood)

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (editing) cancelEdit()
      else onClose()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  const startEdit = () => {
    setDraftTurns(entry.turns)
    setDraftMood(entry.mood)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setConfirmDelete(false)
  }

  const autoGrow = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  const editYou = (idx: number, text: string) => {
    setDraftTurns((t) => t.map((turn, i) => (i === idx ? { ...turn, text } : turn)))
  }

  const editableCount = entry.turns.filter((t) => t.role === 'you' && t.kind !== 'mood').length

  const save = () => {
    const moodMeta = draftMood ? MOODS.find((m) => m.key === draftMood) : null
    // Rebuild turns: trim edits, drop emptied text turns, refresh the mood chip label.
    const turns: Turn[] = draftTurns
      .map((t) => {
        if (t.kind === 'mood' && moodMeta) {
          return { ...t, text: `${moodMeta.emoji} Feeling ${moodMeta.label.toLowerCase()}` }
        }
        return t.role === 'you' ? { ...t, text: t.text.trim() } : t
      })
      .filter((t) => !(t.role === 'you' && t.kind !== 'mood' && t.text === ''))

    const youText = turns
      .filter((t) => t.role === 'you' && t.kind !== 'mood')
      .map((t) => t.text)
      .join(' ')
    const moodLabel = draftMood ? MOODS.find((m) => m.key === draftMood)?.label.toLowerCase() : null

    const updated: Entry = {
      ...entry,
      mood: draftMood,
      turns,
      themes: extractThemes(youText),
      summary: youText ? summarize(turns) : `Checked in — feeling ${moodLabel ?? 'okay'}`,
    }
    onSave(updated)
    setEditing(false)
  }

  const shownTurns = editing ? draftTurns : entry.turns

  return (
    <div className="animate-fade-up absolute inset-0 z-40 flex flex-col bg-bg">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        <button
          onClick={editing ? cancelEdit : onClose}
          className="grid h-9 w-9 place-items-center rounded-full text-soft transition hover:bg-surface-2 active:scale-90"
          aria-label={editing ? 'Cancel editing' : 'Back to journal'}
        >
          {editing ? <X size={18} aria-hidden="true" /> : <ChevronLeft size={20} aria-hidden="true" />}
        </button>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-sm font-bold text-content">{fullWhen(entry.createdAt)}</div>
          <div className="text-[11px] font-bold text-mute">{editing ? 'Editing' : 'Entry'}</div>
        </div>

        {editing ? (
          <button
            onClick={save}
            className="flex items-center gap-1 rounded-full bg-accent px-3.5 py-1.5 text-sm font-bold text-on-accent transition active:scale-95"
          >
            <Check size={15} aria-hidden="true" /> Save
          </button>
        ) : (
          <span
            className="grid h-9 w-9 place-items-center rounded-full text-lg"
            style={{ background: entry.mood ? MOOD_VAR[entry.mood] : 'var(--surface-2)' }}
            aria-label={entry.mood ? `Mood: ${entry.mood}` : 'No mood'}
          >
            {MOODS.find((m) => m.key === entry.mood)?.emoji ?? '📝'}
          </span>
        )}
      </header>

      {/* Edit-mode hint — makes it clear what's editable and what's locked. */}
      {editing && (
        <div className="flex items-center justify-center gap-1.5 border-b border-border bg-accent-soft px-4 py-2 text-center text-[11px] font-bold text-accent-text">
          <Pencil size={12} aria-hidden="true" />
          {editableCount > 0
            ? "Edit your messages & mood · Mira's prompts stay put"
            : "Change your mood below · Mira's prompts stay put"}
        </div>
      )}

      {/* Mood editor */}
      {editing && (
        <div className="border-b border-border px-4 py-3">
          <div className="mb-1.5 text-xs font-bold text-soft">Mood</div>
          <div className="grid grid-cols-5 gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setDraftMood(draftMood === m.key ? null : m.key)}
                aria-pressed={draftMood === m.key}
                aria-label={m.label}
                className={`grid h-11 place-items-center rounded-2xl text-2xl ring-1 transition-all active:scale-90 ${
                  draftMood === m.key ? 'ring-2 ring-accent' : 'ring-border'
                }`}
                style={{ background: draftMood === m.key ? MOOD_VAR[m.key] : 'var(--surface-2)' }}
              >
                <span className={draftMood === m.key ? '' : 'opacity-70'}>{m.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {shownTurns.map((t, i) => {
          const isMira = t.role === 'mira'

          if (t.kind === 'mood') {
            const label = editing && draftMood
              ? `${MOODS.find((m) => m.key === draftMood)?.emoji} Feeling ${MOODS.find((m) => m.key === draftMood)?.label.toLowerCase()}`
              : t.text
            return (
              <div key={i} className="flex justify-end">
                <div className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-on-accent shadow-sm">
                  {label}
                </div>
              </div>
            )
          }

          if (editing && t.role === 'you') {
            return (
              <div key={i} className="flex flex-col items-end gap-1">
                <textarea
                  ref={autoGrow}
                  value={t.text}
                  onChange={(e) => {
                    editYou(i, e.target.value)
                    autoGrow(e.target)
                  }}
                  aria-label="Edit your message"
                  placeholder="Your message…"
                  className="w-[85%] resize-none overflow-hidden rounded-2xl rounded-br-md border-2 border-dashed border-white/70 bg-accent px-4 py-3 text-[15px] font-medium leading-relaxed text-on-accent caret-white shadow-sm outline-none transition placeholder:text-white/60 focus:border-solid focus:ring-2 focus:ring-white/70"
                />
                <span className="flex items-center gap-1 pr-1 text-[10px] font-bold text-mute">
                  <Pencil size={10} aria-hidden="true" /> tap to edit
                </span>
              </div>
            )
          }

          return (
            <div className={`flex items-end gap-2 ${isMira ? 'justify-start' : 'justify-end'}`} key={i}>
              {isMira && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft">
                  <Mascot size={26} decorative />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 text-[15px] font-medium leading-relaxed shadow-sm ${
                  isMira
                    ? 'rounded-2xl rounded-bl-md bg-surface text-content'
                    : 'rounded-2xl rounded-br-md bg-accent text-on-accent'
                } ${editing ? 'select-none opacity-50' : ''}`}
              >
                {t.text}
              </div>
            </div>
          )
        })}

        {/* Themes (read mode) */}
        {!editing && entry.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {entry.themes.map((th) => (
              <span key={th} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold text-accent-text">
                #{th}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {!editing && (
        <div className="border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {confirmDelete ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-content">Delete this entry?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full bg-surface-2 px-4 py-2 text-sm font-bold text-soft transition active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="rounded-full bg-mood-rough px-4 py-2 text-sm font-bold text-white transition active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={startEdit}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-surface-2 py-3 text-sm font-bold text-content transition active:scale-95"
              >
                <Pencil size={16} aria-hidden="true" /> Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete entry"
                className="grid w-12 shrink-0 place-items-center rounded-lg bg-surface-2 text-mood-rough transition active:scale-95"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
